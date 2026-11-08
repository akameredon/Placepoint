import { Pool } from "pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { onWorkers } from "./runtime";

// The advisory lock serialises concurrent cold starts so overlapping DDL can't fail.
const SCHEMA = `
BEGIN;
SELECT pg_advisory_xact_lock(727372);
CREATE TABLE IF NOT EXISTS places (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  postcode TEXT NOT NULL,
  suffix TEXT NOT NULL,
  nipost_status TEXT NOT NULL,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  directions TEXT NOT NULL DEFAULT '',
  landmark TEXT NOT NULL DEFAULT '',
  phone TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy_m REAL,
  owner_token_hash TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (postcode, suffix)
);
CREATE INDEX IF NOT EXISTS places_postcode_idx ON places (postcode);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);
COMMIT;
`;

const g = globalThis as unknown as { __ppPool?: Pool; __ppSchemaReady?: boolean };

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

function connectionString(): string {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

// Workers cannot reuse sockets across requests: one single-connection pool per request, closed when it ends.
const requestPools = new WeakMap<object, Pool>();

function requestPool(): Pool {
  const { ctx } = getCloudflareContext();
  let p = requestPools.get(ctx);
  if (!p) {
    p = new Pool({ connectionString: connectionString(), max: 1, idleTimeoutMillis: 1_000 });
    requestPools.set(ctx, p);
  }
  return p;
}

function pool(): Pool {
  if (onWorkers) return requestPool();
  g.__ppPool ??= new Pool({ connectionString: connectionString(), max: 5, idleTimeoutMillis: 10_000 });
  return g.__ppPool;
}

export async function db(): Promise<Pool> {
  const p = pool();
  if (!g.__ppSchemaReady) {
    await p.query(SCHEMA).catch(async (err) => {
      await p.query("ROLLBACK").catch(() => {});
      throw err;
    });
    g.__ppSchemaReady = true;
  }
  return p;
}

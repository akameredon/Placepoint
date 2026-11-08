import { Pool } from "pg";
import { cache } from "react";

const SCHEMA = `
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

// Cloudflare Workers cannot reuse sockets across requests, so each request gets its own client there.
const onWorkers = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
const requestPool = cache(() => new Pool({ connectionString: connectionString(), max: 1 }));

function pool(): Pool {
  if (onWorkers) return requestPool();
  g.__ppPool ??= new Pool({ connectionString: connectionString(), max: 5, idleTimeoutMillis: 10_000 });
  return g.__ppPool;
}

export async function db(): Promise<Pool> {
  const p = pool();
  if (!g.__ppSchemaReady) {
    await p.query(SCHEMA);
    g.__ppSchemaReady = true;
  }
  return p;
}

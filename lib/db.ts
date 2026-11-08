import { Pool } from "pg";

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
`;

const g = globalThis as unknown as { __ppPool?: Pool; __ppSchema?: Promise<void> };

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

function pool(): Pool {
  if (!g.__ppPool) {
    const connectionString = databaseUrl();
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    g.__ppPool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000 });
  }
  return g.__ppPool;
}

export async function db(): Promise<Pool> {
  const p = pool();
  if (!g.__ppSchema) {
    g.__ppSchema = p.query(SCHEMA).then(
      () => undefined,
      (err) => {
        g.__ppSchema = undefined;
        throw err;
      },
    );
  }
  await g.__ppSchema;
  return p;
}

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "./db";

export function newOwnerToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenMatches(token: string, hash: string): boolean {
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : null;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Raw IPs are never stored; only a salted hash is used as the rate-limit key. */
function ipKey(req: Request): string {
  const salt = process.env.IP_HASH_SALT ?? "placepoint";
  return createHash("sha256").update(salt + clientIp(req)).digest("hex").slice(0, 32);
}

/** Fixed-window limiter backed by Postgres so it works across serverless instances. */
export async function rateLimit(req: Request, bucket: string, limit: number, windowSec: number): Promise<boolean> {
  try {
    const pool = await db();
    const { rows } = await pool.query<{ count: number }>(
      `INSERT INTO rate_limits (key, window_start, count) VALUES ($1, now(), 1)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN rate_limits.window_start < now() - make_interval(secs => $2::double precision) THEN 1 ELSE rate_limits.count + 1 END,
         window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => $2::double precision) THEN now() ELSE rate_limits.window_start END
       RETURNING count`,
      [`${bucket}:${ipKey(req)}`, windowSec],
    );
    if (Math.random() < 0.01) {
      pool.query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`).catch(() => {});
    }
    return rows[0].count <= limit;
  } catch {
    return true;
  }
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers });
}

export function tooMany() {
  return json({ ok: false, error: "Too many requests. Please wait a minute and try again." }, 429);
}

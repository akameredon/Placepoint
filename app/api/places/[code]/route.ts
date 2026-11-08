import { parsePlaceCode } from "@/lib/code";
import { db } from "@/lib/db";
import { findPlace, placeUpdate, toPublic } from "@/lib/places";
import { bearer, json, rateLimit, tokenMatches, tooMany } from "@/lib/security";

async function authorised(req: Request, raw: string) {
  const pc = parsePlaceCode(raw);
  if (!pc) return { error: json({ ok: false, error: "Invalid Placepoint code" }, 400) };
  if (!(await rateLimit(req, "owner", 30, 60))) return { error: tooMany() };
  const row = await findPlace(pc);
  if (!row) return { error: json({ ok: false, error: "Placepoint not found" }, 404) };
  const token = bearer(req);
  if (!token || !tokenMatches(token, row.owner_token_hash)) {
    return { error: json({ ok: false, error: "You are not allowed to change this Placepoint" }, 403) };
  }
  return { row };
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/places/[code]">) {
  const { code } = await ctx.params;
  const auth = await authorised(req, code);
  if ("error" in auth) return auth.error;
  const parsed = placeUpdate.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  const u = parsed.data;
  const pool = await db();
  const { rows } = await pool.query(
    `UPDATE places SET
       kind = COALESCE($2, kind), label = COALESCE($3, label), directions = COALESCE($4, directions),
       landmark = COALESCE($5, landmark), phone = CASE WHEN $6::boolean THEN $7 ELSE phone END,
       lat = COALESCE($8, lat), lng = COALESCE($9, lng), accuracy_m = CASE WHEN $10::boolean THEN $11 ELSE accuracy_m END,
       updated_at = now()
     WHERE code = $1 RETURNING *`,
    [auth.row.code, u.kind ?? null, u.label ?? null, u.directions ?? null, u.landmark ?? null,
      "phone" in u, u.phone ?? null, u.lat ?? null, u.lng ?? null, "accuracy_m" in u, u.accuracy_m ?? null],
  );
  return json({ ok: true, place: toPublic(rows[0]) });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/places/[code]">) {
  const { code } = await ctx.params;
  const auth = await authorised(req, code);
  if ("error" in auth) return auth.error;
  const pool = await db();
  await pool.query("DELETE FROM places WHERE code = $1", [auth.row.code]);
  return json({ ok: true });
}

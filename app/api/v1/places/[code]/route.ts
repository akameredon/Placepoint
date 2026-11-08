import { parsePlaceCode } from "@/lib/code";
import { findPlace, toPublic } from "@/lib/places";
import { json, rateLimit, tooMany } from "@/lib/security";
import { withUrl } from "@/lib/site";

const CORS = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };

export async function GET(req: Request, ctx: RouteContext<"/api/v1/places/[code]">) {
  const { code } = await ctx.params;
  const pc = parsePlaceCode(code);
  if (!pc) return json({ ok: false, error: "Invalid Placepoint code" }, 400, CORS);
  if (!(await rateLimit(req, "public", 120, 60))) return tooMany();
  const row = await findPlace(pc);
  if (!row) return json({ ok: false, error: "Placepoint not found" }, 404, CORS);
  return json({ ok: true, data: withUrl(toPublic(row)) }, 200, CORS);
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, "Access-Control-Allow-Methods": "GET, OPTIONS" } });
}

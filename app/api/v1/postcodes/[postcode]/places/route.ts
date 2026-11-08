import { parsePostcode } from "@/lib/code";
import { placesAtPostcode } from "@/lib/places";
import { json, rateLimit, tooMany } from "@/lib/security";
import { withUrl } from "@/lib/site";

const CORS = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };

export async function GET(req: Request, ctx: RouteContext<"/api/v1/postcodes/[postcode]/places">) {
  const { postcode } = await ctx.params;
  const pc = parsePostcode(postcode);
  if (!pc) return json({ ok: false, error: "Invalid postcode" }, 400, CORS);
  if (!(await rateLimit(req, "public", 120, 60))) return tooMany({ "Access-Control-Allow-Origin": "*" });
  return json({ ok: true, postcode: pc.toString(), data: (await placesAtPostcode(pc.compact)).map(withUrl) }, 200, CORS);
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, "Access-Control-Allow-Methods": "GET, OPTIONS" } });
}

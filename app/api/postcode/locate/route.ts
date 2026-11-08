import { nearbyBuildings, reverseGeocode } from "@/lib/nipost";
import { json, rateLimit, tooMany } from "@/lib/security";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return json({ ok: false, error: "lat and lng are required" }, 400);
  }
  if (!(await rateLimit(req, "locate", 30, 60))) return tooMany();
  const [rev, near] = await Promise.all([reverseGeocode(lat, lng, 50), nearbyBuildings(lat, lng, 80)]);
  if (!rev.ok) return json({ ok: false, error: rev.error }, rev.status);
  return json({
    ok: true,
    found: rev.data.found,
    nearest: rev.data.unit,
    message: rev.data.message,
    nearby: near.ok ? near.data.slice(0, 8) : [],
  });
}

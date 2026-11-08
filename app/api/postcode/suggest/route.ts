import { suggest } from "@/lib/nipost";
import { json, rateLimit, tooMany } from "@/lib/security";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 20);
  if (!q) return json({ ok: true, segment: null, suggestions: [] });
  if (!(await rateLimit(req, "suggest", 120, 60))) return tooMany();
  const r = await suggest(q);
  if (!r.ok) return json({ ok: false, error: r.error }, r.status);
  return json({ ok: true, ...r.data });
}

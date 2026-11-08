import { parsePostcode, postcodeError } from "@/lib/code";
import { verifyPostcode } from "@/lib/nipost";
import { json, rateLimit, tooMany } from "@/lib/security";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("code") ?? "";
  const code = parsePostcode(raw);
  if (!code) return json({ ok: false, error: postcodeError(raw) ?? "Invalid postcode" }, 400);
  if (!(await rateLimit(req, "validate", 60, 60))) return tooMany();
  const { verification, detail } = await verifyPostcode(code);
  return json({ ok: true, postcode: code.toString(), spaced: code.spaced, verification, detail });
}

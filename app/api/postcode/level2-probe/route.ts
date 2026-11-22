import { parsePostcode, postcodeError } from "@/lib/code";
import { lookupPostcodeLevel2, verifyPostcode } from "@/lib/nipost";
import { bearer, hashToken, json, rateLimit, tooMany, tokenMatches } from "@/lib/security";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * Restricted diagnostic endpoint for an operator-controlled, one-off L2 check.
 * L2 returns house-address data and can consume NIPOST credits; never expose the
 * raw house address or allow this route to be called without an explicit opt-in.
 */
export async function POST(req: Request) {
  const expectedToken = process.env.NIPOST_L2_PROBE_TOKEN;
  if (!expectedToken || process.env.NIPOST_MAX_LEVEL !== "2") {
    return json({ ok: false, error: "Level 2 probe is not enabled." }, 503, NO_STORE);
  }

  const suppliedToken = bearer(req);
  if (!suppliedToken || !tokenMatches(suppliedToken, hashToken(expectedToken))) {
    return json({ ok: false, error: "Unauthorized." }, 401, NO_STORE);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Request body must be valid JSON." }, 400, NO_STORE);
  }
  const raw = body && typeof body === "object" && "code" in body && typeof body.code === "string"
    ? body.code
    : "";
  const code = parsePostcode(raw);
  if (!code) {
    return json({ ok: false, error: postcodeError(raw) ?? "Invalid postcode" }, 400, NO_STORE);
  }

  if (!(await rateLimit(req, "nipost-level2-probe", 1, 86400))) {
    return tooMany(NO_STORE);
  }

  // A free L1 check prevents paid requests for well-formed but unassigned codes.
  const level1 = await verifyPostcode(code);
  if (level1.verification !== "verified") {
    const status = level1.verification === "not_found" ? 404 : 502;
    return json({
      ok: false,
      postcode: code.toString(),
      verification: level1.verification,
      detail: level1.detail ?? null,
      level2_requested: false,
    }, status, NO_STORE);
  }

  const result = await lookupPostcodeLevel2(code);
  if (!result.ok) {
    return json({
      ok: false,
      postcode: code.toString(),
      verification: "verified",
      level2_requested: true,
      error: result.error,
    }, result.status, NO_STORE);
  }

  const address = result.data.administrative_address;
  return json({
    ok: true,
    postcode: code.toString(),
    verification: result.data.valid ? "verified" : "not_found",
    level: 2,
    administrative_address: address ? {
      state_name: address.state_name,
      lga_name: address.lga_name,
      locality_name: address.locality_name,
      zone: address.zone,
    } : null,
    has_recent_house_address: Boolean(result.data.recent_house_address),
    recent_house_address: "redacted",
  }, 200, NO_STORE);
}

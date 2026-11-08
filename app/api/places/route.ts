import { compactCode, parsePostcode, randomSuffix } from "@/lib/code";
import { db } from "@/lib/db";
import { verifyPostcode } from "@/lib/nipost";
import { placeInput, toPublic } from "@/lib/places";
import { hashToken, json, newOwnerToken, rateLimit, tooMany } from "@/lib/security";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = placeInput.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  const input = parsed.data;
  const postcode = parsePostcode(input.postcode);
  if (!postcode) return json({ ok: false, error: "That is not a valid NIPOST postcode" }, 400);
  if (!(await rateLimit(req, "create", 20, 3600))) return tooMany();

  const { verification } = await verifyPostcode(postcode);
  if (verification === "not_found") {
    return json({ ok: false, error: "NIPOST says this postcode is not assigned to any building. Check it and try again." }, 422);
  }

  const token = newOwnerToken();
  const pool = await db();
  for (let attempt = 0; attempt < 12; attempt++) {
    const suffix = randomSuffix();
    const code = compactCode({ postcode, suffix });
    const { rows } = await pool.query(
      `INSERT INTO places (code, postcode, suffix, nipost_status, kind, label, directions, landmark, phone, lat, lng, accuracy_m, owner_token_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT DO NOTHING RETURNING *`,
      [code, postcode.compact, suffix, verification, input.kind, input.label, input.directions, input.landmark,
        input.phone ?? null, input.lat, input.lng, input.accuracy_m ?? null, hashToken(token)],
    );
    if (rows[0]) return json({ ok: true, place: toPublic(rows[0]), owner_token: token }, 201);
  }
  return json({ ok: false, error: "This building has too many Placepoints. Please contact support." }, 409);
}

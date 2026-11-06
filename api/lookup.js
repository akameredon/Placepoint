// Vercel serverless function. Keeps the NIPOST API key on the server, never in the browser.
// Set NG_POSTCODE_API_KEY in Vercel > Project > Settings > Environment Variables.
import { Postcode, parse } from "ng-postcode-js";
import { ApiError, lookup } from "ng-postcode-js/api";
import { Client, TransportError } from "ng-postcode-js/client";

export default async function handler(req, res) {
  const code = parse(String(req.query.code || ""));
  if (!(code instanceof Postcode)) return res.status(400).json({ ok: false, error: String(code) });
  const key = process.env.NG_POSTCODE_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: "NG_POSTCODE_API_KEY is not set" });
  const found = await new Client(key).send(lookup(code, 1)); // level 1 = free "is this code assigned?"
  if (found instanceof ApiError || found instanceof TransportError)
    return res.status(502).json({ ok: false, error: String(found) });
  res.status(200).json({ ok: true, code: String(code), valid: found.valid, status: found.status });
}

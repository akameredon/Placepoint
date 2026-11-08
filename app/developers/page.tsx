import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Developers & API" };

const one = `curl ${SITE_URL}/api/v1/places/FC03B06AG12-7K`;
const oneRes = `{
  "ok": true,
  "data": {
    "code": "FC03B06AG127K",
    "display": "FC-03-B06-AG-12 · 7K",
    "postcode": "FC-03-B06-AG-12",
    "suffix": "7K",
    "nipost_status": "verified",
    "kind": "gate",
    "label": "Blue gate",
    "directions": "Second building on the left",
    "landmark": "Opposite Total filling station",
    "phone": null,
    "lat": 9.05785, "lng": 7.49508, "accuracy_m": 6,
    "url": "${SITE_URL}/p/FC03B06AG12-7K",
    ...
  }
}`;
const many = `curl ${SITE_URL}/api/v1/postcodes/FC-03-B06-AG-12/places`;

export default function Page() {
  return (
    <article className="prose-pp mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Developers &amp; businesses</h1>
      <p className="mt-3">
        Logistics companies, e-commerce stores, emergency services and utilities can resolve any Placepoint code to an exact coordinate, entrance type and
        human directions. The API is free, read-only, needs no key and allows cross-origin requests (CORS).
      </p>

      <h2>Code format</h2>
      <p>A Placepoint code is the 11-character NIPOST postcode plus a 2-character suffix. All of these forms are accepted: <code>FC-03-B06-AG-12 · 7K</code>, <code>FC03B06AG12-7K</code>, <code>FC03B06AG127K</code>.</p>

      <h2>Resolve one Placepoint</h2>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">{one}</pre>
      <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">{oneRes}</pre>

      <h2>List Placepoints in a building</h2>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">{many}</pre>

      <h2>Limits &amp; errors</h2>
      <ul>
        <li>120 requests per minute per IP. Exceeding it returns HTTP 429.</li>
        <li><code>404</code> when a code doesn&apos;t exist or was deleted; <code>400</code> for a malformed code.</li>
        <li>Responses are cacheable for 60 seconds.</li>
      </ul>

      <h2>Health</h2>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">{`curl ${SITE_URL}/api/health`}</pre>

      <p className="mt-8">Need higher limits, bulk onboarding of estates, or a white-label integration? Email us from the footer.</p>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy notice" };

export default function Page() {
  return (
    <article className="prose-pp mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Privacy notice</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: November 2026</p>
      <p className="mt-4">
        {SITE_NAME} lets you mark the exact entrance of a building on top of its NIPOST digital postcode and share it. This notice explains what
        personal data we process and your rights under the <strong>Nigeria Data Protection Act 2023 (NDPA)</strong>.
      </p>

      <h2>Who we are</h2>
      <p>{SITE_NAME} is the data controller. Contact us about any privacy matter at <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Placepoint content you enter:</strong> the building postcode, the pin location (latitude/longitude and GPS accuracy), type, name, directions, landmark and an optional phone number.</li>
        <li><strong>An edit key:</strong> a random secret created for you. We store only a one-way hash of it, never the key itself.</li>
        <li><strong>Abuse prevention:</strong> a one-way salted hash of your IP address, used to rate-limit requests and purged once it is more than one hour old. We never store raw IP addresses.</li>
        <li><strong>View count:</strong> an anonymous counter of how many times a Placepoint was opened.</li>
      </ul>
      <p>We do <strong>not</strong> require an account, we do not track your location in the background, and we do not use advertising or tracking cookies. Your device&apos;s location is read only when you press a location button, and only the pin you save is stored.</p>

      <h2>Why we process it (lawful basis)</h2>
      <ul>
        <li><strong>Consent (NDPA s.25(1)(a)):</strong> you tick a consent box before creating a Placepoint, agreeing that its content becomes publicly visible to anyone with the code or link.</li>
        <li><strong>Legitimate interest:</strong> rate limiting and security, to keep the service available and prevent abuse.</li>
      </ul>

      <h2>Who can see it</h2>
      <p>
        Placepoint content is <strong>public</strong>: anyone with the code or link, and anyone using our public API, can see it. Placepoints are not listed in
        search engines. Only add a phone number if you are happy for it to be public.
      </p>

      <h2>Who we share it with</h2>
      <ul>
        <li><strong>NIPOST</strong> (postcode.gov.ng): the postcode you enter, and your coordinates when you use &quot;Use my location&quot;, are sent to the official NIPOST API to confirm the postcode.</li>
        <li><strong>Hosting and database providers</strong> that run the service for us under data-processing terms.</li>
        <li><strong>Map tile providers</strong> (OpenStreetMap, Esri) receive standard web requests from your browser when a map is displayed.</li>
      </ul>
      <p>We do not sell personal data. Some providers may process data outside Nigeria; where they do, we rely on safeguards permitted by NDPA Part VIII.</p>

      <h2>How long we keep it</h2>
      <p>Placepoint content is kept until you delete it. Rate-limit records older than one hour are purged automatically. When you delete a Placepoint it is erased from our live database immediately.</p>

      <h2>Your rights</h2>
      <p>Under the NDPA you can access, correct, delete, or withdraw consent for your data, object to processing, and request a copy of it. You can edit or delete a Placepoint yourself at any time from <Link className="underline" href="/mine">My places</Link> or with your edit key. For anything else, email us. You may also complain to the <strong>Nigeria Data Protection Commission</strong> (ndpc.gov.ng).</p>

      <h2>Security</h2>
      <p>All traffic is encrypted with HTTPS. Edit keys and IP addresses are stored only as one-way hashes, and the NIPOST API key is kept on our servers only.</p>

      <h2>Children</h2>
      <p>{SITE_NAME} is not directed at children under 13 and should not be used by them without a parent or guardian.</p>
    </article>
  );
}

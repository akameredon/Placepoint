import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <article className="prose-pp mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Terms of use</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: November 2026</p>
      <h2>The service</h2>
      <p>{SITE_NAME} is a free service for marking and sharing precise entrance locations on top of Nigeria&apos;s NIPOST digital postcodes. It is provided &quot;as is&quot;, without warranties.</p>
      <h2>Your content</h2>
      <ul>
        <li>Only create Placepoints for places you live at, own, manage or are authorised to describe.</li>
        <li>Do not post false, misleading, offensive or unlawful content, or another person&apos;s personal data without their permission.</li>
        <li>You are responsible for the accuracy of what you publish. We may remove content that breaks these terms.</li>
      </ul>
      <h2>Emergencies</h2>
      <p>{SITE_NAME} helps responders find you but is not an emergency service. In an emergency call 112.</p>
      <h2>Postcodes</h2>
      <p>Postcode data is provided by NIPOST. {SITE_NAME} is an independent product and is not operated by NIPOST or the Federal Government.</p>
      <h2>API use</h2>
      <p>The public API is free within its rate limits. Do not scrape it in bulk or use it to build a copy of the database.</p>
      <h2>Contact</h2>
      <p><a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </article>
  );
}

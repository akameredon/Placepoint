export const SITE_NAME = "Placepoint";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "johnsondonald316@gmail.com";
export const TAGLINE = "Your exact gate, door or shop — on top of your NIPOST postcode.";

export function withUrl<T extends { slug: string }>(p: T): T & { url: string } {
  return { ...p, url: `${SITE_URL}/p/${p.slug}` };
}

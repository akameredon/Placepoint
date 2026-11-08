import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — precise addresses on Nigeria's postcode`, template: `%s · ${SITE_NAME}` },
  description: TAGLINE,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: "website", description: TAGLINE },
};

export const viewport: Viewport = { themeColor: "#008751", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="no-print border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <svg width="26" height="26" viewBox="0 0 34 46" aria-hidden><path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 29 17 29s17-16.3 17-29C34 7.6 26.4 0 17 0z" fill="#008751"/><circle cx="17" cy="17" r="7" fill="#fff"/></svg>
              {SITE_NAME}
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/mine" className="text-slate-600 hover:text-slate-900">My places</Link>
              <Link href="/developers" className="hidden text-slate-600 hover:text-slate-900 sm:inline">Developers</Link>
              <Link href="/new" className="rounded-lg bg-brand px-3 py-2 text-white hover:bg-brand-dark">Create</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} {SITE_NAME}. Built on Nigeria&apos;s NIPOST digital postcode.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-slate-800">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-800">Terms</Link>
              <Link href="/developers" className="hover:text-slate-800">API</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

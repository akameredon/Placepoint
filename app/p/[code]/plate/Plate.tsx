"use client";

import Link from "next/link";
import Qr from "@/components/Qr";
import type { PublicPlace } from "@/lib/places";

export default function Plate({ place, url }: { place: PublicPlace; url: string }) {
  const link = url;
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="no-print mb-6 flex gap-2">
        <Link href={`/p/${place.slug}`} className="btn-ghost">Back</Link>
        <button type="button" className="btn-primary flex-1" onClick={() => window.print()}>Print plate</button>
      </div>
      <div className="mx-auto w-full max-w-md rounded-3xl border-4 border-[#008751] bg-white p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#008751]">Placepoint</p>
        <p className="mt-2 text-xl font-semibold">{place.label}</p>
        <div className="mt-5 flex justify-center"><Qr text={link} size={240} /></div>
        <p className="mt-5 whitespace-nowrap font-mono text-2xl font-extrabold tracking-wide sm:text-3xl">{place.postcode}</p>
        <p className="font-mono text-5xl font-extrabold tracking-widest text-[#008751]">{place.suffix}</p>
        <p className="mt-4 text-sm text-slate-600">Scan for map &amp; directions · NIPOST postcode {place.postcode}</p>
        <p className="mt-1 break-all font-mono text-xs text-slate-500">{link.replace(/^https?:\/\//, "")}</p>
      </div>
    </div>
  );
}

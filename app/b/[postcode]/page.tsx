import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parsePostcode } from "@/lib/code";
import { KIND_LABELS, placesAtPostcode } from "@/lib/places";

export async function generateMetadata({ params }: PageProps<"/b/[postcode]">): Promise<Metadata> {
  const pc = parsePostcode(decodeURIComponent((await params).postcode));
  return { title: pc ? `Placepoints at ${pc.toString()}` : "Invalid postcode", robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/b/[postcode]">) {
  const pc = parsePostcode(decodeURIComponent((await params).postcode));
  if (!pc) notFound();
  const places = await placesAtPostcode(pc.compact);
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="text-sm text-slate-500">NIPOST building postcode</p>
      <h1 className="font-mono text-3xl font-bold tracking-wider">{pc.toString()}</h1>
      <p className="mt-2 text-slate-600">{places.length === 0 ? "No Placepoints have been created in this building yet." : `${places.length} Placepoint${places.length === 1 ? "" : "s"} in this building:`}</p>
      <ul className="mt-4 space-y-2">
        {places.map((p) => (
          <li key={p.code}>
            <Link href={`/p/${p.slug}`} className="card flex items-center justify-between hover:border-brand">
              <span>
                <span className="block font-semibold">{p.label}</span>
                <span className="text-sm text-slate-500">{KIND_LABELS[p.kind]}</span>
              </span>
              <span className="font-mono text-lg font-bold text-brand">{p.suffix}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/new" className="btn-primary mt-6">Add a Placepoint here</Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useOwned } from "@/lib/owned";

export default function Mine() {
  const items = useOwned();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">My places</h1>
      <p className="mt-1 text-sm text-slate-600">Placepoints you created on this device. No account needed — the edit key is stored only on this device.</p>
      {items && items.length === 0 && (
        <div className="card mt-6 text-center">
          <p className="text-slate-600">You haven&apos;t created any Placepoints on this device yet.</p>
          <Link href="/new" className="btn-primary mt-4">Create my first Placepoint</Link>
        </div>
      )}
      <ul className="mt-6 space-y-2">
        {items?.map((p) => (
          <li key={p.slug} className="card flex items-center justify-between gap-3">
            <Link href={`/p/${p.slug}`} className="min-w-0">
              <span className="block truncate font-semibold">{p.label}</span>
              <span className="font-mono text-sm text-slate-500">{p.display}</span>
            </Link>
            <Link href={`/p/${p.slug}/manage`} className="btn-ghost py-2">Manage</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

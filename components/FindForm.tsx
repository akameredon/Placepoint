"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FindForm() {
  const router = useRouter();
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <div>
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const clean = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (clean.length === 13) router.push(`/p/${clean.slice(0, 11)}-${clean.slice(11)}`);
        else if (clean.length === 11) router.push(`/b/${clean}`);
        else setErr("Enter a 13-character Placepoint code or an 11-character postcode.");
      }}
    >
      <input
        className="input font-mono uppercase tracking-wider"
        placeholder="FC-03-B06-AG-12 · 7K"
        value={v}
        onChange={(e) => { setV(e.target.value); setErr(""); }}
        aria-label="Placepoint code or postcode"
      />
      <button className="btn-primary whitespace-nowrap">Find</button>
    </form>
    {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}

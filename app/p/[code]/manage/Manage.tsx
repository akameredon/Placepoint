"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Map from "@/components/Map";
import { listOwned, removeOwned, saveOwned, useOwned } from "@/lib/owned";
import { KIND_LABELS, KINDS, type PublicPlace } from "@/lib/kinds";

export default function Manage({ place }: { place: PublicPlace }) {
  const router = useRouter();
  const owned = useOwned();
  const token = owned?.find((x) => x.slug === place.slug)?.token ?? null;
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState({ kind: place.kind, label: place.label, directions: place.directions, landmark: place.landmark, phone: place.phone ?? "" });
  const [pin, setPin] = useState({ lat: place.lat, lng: place.lng });
  const [moved, setMoved] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function remember(t: string) {
    saveOwned({ slug: place.slug, display: place.display, label: form.label, token: t, created_at: place.created_at });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setMsg("");
    const body: Record<string, unknown> = { ...form };
    if (moved) Object.assign(body, { lat: pin.lat, lng: pin.lng, accuracy_m: null });
    const r = await fetch(`/api/places/${place.slug}`, { method: "PATCH", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify(body) }).catch(() => null);
    const j = r ? await r.json().catch(() => null) : null;
    setBusy(false);
    if (!j?.ok) return setErr(j?.error ?? "Network problem. Try again.");
    const owned = listOwned().find((x) => x.slug === place.slug);
    if (owned) saveOwned({ ...owned, label: j.place.label });
    setMsg("Saved.");
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this Placepoint permanently? The code and link will stop working.")) return;
    setBusy(true); setErr("");
    const r = await fetch(`/api/places/${place.slug}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } }).catch(() => null);
    const j = r ? await r.json().catch(() => null) : null;
    setBusy(false);
    if (!j?.ok) return setErr(j?.error ?? "Network problem. Try again.");
    removeOwned(place.slug);
    router.push("/mine?deleted=1");
  }

  if (owned === null) return <div className="mx-auto max-w-xl px-4 py-8 text-slate-500">Loading…</div>;

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-bold">Manage {place.display}</h1>
        <p className="mt-2 text-slate-600">This device doesn&apos;t hold the edit key for this Placepoint. Paste the edit key you saved when you created it.</p>
        <form className="card mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); if (keyInput.trim()) remember(keyInput.trim()); }}>
          <input className="input font-mono" placeholder="Edit key" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
          <button className="btn-primary w-full">Continue</button>
        </form>
        <Link className="mt-4 inline-block text-sm underline" href={`/p/${place.slug}`}>Back to Placepoint</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link className="text-sm underline" href={`/p/${place.slug}`}>← Back to Placepoint</Link>
      <h1 className="mt-2 text-2xl font-bold">Manage {place.display}</h1>

      <div className="card mt-4 text-sm">
        <p className="font-semibold">Your edit key</p>
        <p className="mt-1 text-slate-600">Anyone with this key can edit or delete this Placepoint. Save it (e.g. in a note) so you can manage it from another phone.</p>
        <div className="mt-2 flex gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2">{showKey ? token : "•".repeat(24)}</code>
          <button type="button" className="btn-ghost py-2" onClick={() => setShowKey((s) => !s)}>{showKey ? "Hide" : "Show"}</button>
          <button type="button" className="btn-ghost py-2" onClick={() => navigator.clipboard.writeText(token)}>Copy</button>
        </div>
      </div>

      <form className="card mt-4 space-y-4" onSubmit={save}>
        <div>
          <label className="label" htmlFor="kind">Type</label>
          <select id="kind" className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as PublicPlace["kind"] })}>
            {KINDS.map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="label">Name</label><input id="label" className="input" maxLength={80} required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
        <div><label className="label" htmlFor="dir">Directions</label><textarea id="dir" className="input min-h-24" maxLength={500} value={form.directions} onChange={(e) => setForm({ ...form, directions: e.target.value })} /></div>
        <div><label className="label" htmlFor="lm">Landmark</label><input id="lm" className="input" maxLength={120} value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} /></div>
        <div><label className="label" htmlFor="ph">Phone (public, optional)</label><input id="ph" className="input" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div>
          <p className="label">Location — drag the pin to move it</p>
          <Map center={{ lat: place.lat, lng: place.lng }} zoom={19} pin={pin} editable onPin={(p) => { setPin(p); setMoved(true); }} className="h-72" />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </form>

      <div className="card mt-4 border-red-200">
        <h2 className="font-semibold text-red-700">Delete Placepoint</h2>
        <p className="mt-1 text-sm text-slate-600">Permanently erases the location and all details from our database (your NDPA right to erasure).</p>
        <button type="button" className="btn mt-3 bg-red-600 text-white hover:bg-red-700" disabled={busy} onClick={del}>Delete permanently</button>
      </div>
    </div>
  );
}

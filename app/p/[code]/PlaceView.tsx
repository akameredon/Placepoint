"use client";

import Link from "next/link";
import { useState } from "react";
import Map from "@/components/Map";
import Qr from "@/components/Qr";
import { distanceM, formatDistance, getFix } from "@/lib/geo";
import { useOwned } from "@/lib/owned";
import { KIND_LABELS, type PublicPlace } from "@/lib/kinds";

export default function PlaceView({ place, url, created }: { place: PublicPlace; url: string; created: boolean }) {
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locErr, setLocErr] = useState("");
  const [copied, setCopied] = useState(false);

  const owner = Boolean(useOwned()?.some((x) => x.slug === place.slug));
  const shareUrl = url;
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=driving`;
  const shareText = `${place.label} — Placepoint ${place.display}\n${place.directions ? place.directions + "\n" : ""}${shareUrl}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: place.label, text: shareText, url: shareUrl }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function howFar() {
    setLocErr("");
    try { const f = await getFix(); setMe({ lat: f.lat, lng: f.lng }); } catch (e) { setLocErr((e as Error).message); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {created && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Your Placepoint is live.</p>
          <p className="mt-1">Share the link or print the QR plate for your gate. Only this device can edit or delete it — keep the edit key from <Link className="underline" href={`/p/${place.slug}/manage`}>Manage</Link> somewhere safe.</p>
        </div>
      )}

      <p className="text-sm font-medium text-slate-500">{KIND_LABELS[place.kind]}</p>
      <h1 className="text-3xl font-bold">{place.label}</h1>
      <p className="mt-2 font-mono text-2xl font-bold tracking-wider">
        {place.postcode} <span className="text-slate-400">·</span> <span className="text-brand">{place.suffix}</span>
      </p>
      <p className="mt-1 text-sm">
        {place.nipost_status === "verified"
          ? <span className="text-emerald-700">✓ Postcode confirmed by NIPOST</span>
          : <span className="text-amber-700">Postcode format valid; not yet confirmed by NIPOST</span>}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a className="btn-primary" href={navUrl} target="_blank" rel="noreferrer">Navigate</a>
        <a className="btn-ghost" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>
        <button type="button" className="btn-ghost" onClick={share}>{copied ? "Link copied" : "Share link"}</button>
        {place.phone ? <a className="btn-ghost" href={`tel:${place.phone.replace(/\s/g, "")}`}>Call</a> : <button type="button" className="btn-ghost" onClick={howFar}>How far?</button>}
      </div>

      <div className="mt-6">
        <Map center={place} zoom={19} pin={place} accuracy={place.accuracy_m} me={me} className="h-96" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <span className="font-mono">{place.lat.toFixed(6)}, {place.lng.toFixed(6)}</span>
          {me ? <span className="font-medium text-slate-800">You are {formatDistance(distanceM(me, place))} away (straight line)</span>
            : place.phone ? <button type="button" className="underline" onClick={howFar}>How far am I?</button> : null}
        </div>
        {locErr && <p className="mt-1 text-sm text-red-600">{locErr}</p>}
      </div>

      {(place.directions || place.landmark) && (
        <div className="card mt-6 space-y-3">
          {place.directions && (<div><h2 className="text-sm font-semibold text-slate-500">Directions</h2><p className="mt-1 whitespace-pre-line">{place.directions}</p></div>)}
          {place.landmark && (<div><h2 className="text-sm font-semibold text-slate-500">Landmark</h2><p className="mt-1">{place.landmark}</p></div>)}
        </div>
      )}

      <div className="card mt-6 flex flex-col items-center gap-4 sm:flex-row">
        <Qr text={shareUrl} size={140} />
        <div className="flex-1 text-sm text-slate-600">
          <p>Scan to open this Placepoint. Print it and fix it to the gate or door.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn-ghost" href={`/p/${place.slug}/plate`}>Print QR plate</Link>
            <Link className="btn-ghost" href={`/b/${place.postcode.replace(/-/g, "")}`}>Other points in this building</Link>
            {owner && <Link className="btn-ghost" href={`/p/${place.slug}/manage`}>Edit / delete</Link>}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Content is provided by the person who created this Placepoint. <Link className="underline" href={`mailto:?subject=Report Placepoint ${place.display}`}>Report a problem</Link>
      </p>
    </div>
  );
}

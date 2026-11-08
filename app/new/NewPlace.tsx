"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Postcode, parse } from "ng-postcode-js";
import { useEffect, useRef, useState } from "react";
import Map from "@/components/Map";
import { type Fix, NIGERIA_CENTER, formatDistance, getFix, refineFix } from "@/lib/geo";
import { KIND_LABELS, KINDS } from "@/lib/kinds";
import { saveOwned } from "@/lib/owned";

const KIND_OPTIONS = KINDS.map((k) => [k, KIND_LABELS[k]] as const);

type Verification = "verified" | "not_found" | "unverified";
interface Nearby { postcode: string; display: string; distance_m: number | null }

export default function NewPlace() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [postcode, setPostcode] = useState("");
  const [verification, setVerification] = useState<Verification | null>(null);
  const [checking, setChecking] = useState(false);
  const [pcMsg, setPcMsg] = useState("");
  const [locating, setLocating] = useState(false);
  const [nearby, setNearby] = useState<Nearby[]>([]);
  const [sugg, setSugg] = useState<{ q: string; list: string[] }>({ q: "", list: [] });

  const [fix, setFix] = useState<Fix | null>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsMsg, setGpsMsg] = useState("");
  const [refining, setRefining] = useState(false);

  const [kind, setKind] = useState("gate");
  const [label, setLabel] = useState("");
  const [directions, setDirections] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parsed = parse(postcode);
  const valid = parsed instanceof Postcode;
  const lastChecked = useRef("");
  const pinnedByHand = useRef(false);

  async function check(code: string) {
    setChecking(true);
    setPcMsg("");
    try {
      const r = await fetch(`/api/postcode/validate?code=${encodeURIComponent(code)}`);
      const j = await r.json();
      if (!j.ok) { setVerification(null); setPcMsg(j.error); return; }
      lastChecked.current = j.postcode;
      setPostcode(j.postcode);
      setVerification(j.verification);
      if (j.verification === "unverified") setPcMsg(j.detail ? `Couldn't confirm with NIPOST right now (${j.detail}). You can still continue.` : "Couldn't confirm with NIPOST right now. You can still continue.");
    } catch {
      setPcMsg("Network problem. Check your connection and try again.");
    } finally {
      setChecking(false);
    }
  }

  async function locate() {
    setLocating(true);
    setPcMsg("");
    try {
      const f = await getFix();
      setFix(f);
      setPin({ lat: f.lat, lng: f.lng });
      setAccuracy(f.accuracy);
      const r = await fetch(`/api/postcode/locate?lat=${f.lat}&lng=${f.lng}`);
      const j = await r.json();
      if (!j.ok) { setPcMsg(j.error); return; }
      setNearby(j.nearby ?? []);
      if (j.found && j.nearest) {
        setPostcode(j.nearest.postcode);
        await check(j.nearest.postcode);
      } else {
        setPcMsg("No NIPOST building found right where you are. Pick one nearby or type your postcode.");
      }
    } catch (e) {
      setPcMsg((e as Error).message);
    } finally {
      setLocating(false);
    }
  }

  // Segment-aware autocomplete while typing a partial code.
  useEffect(() => {
    const clean = postcode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length < 2 || clean.length >= 11) return;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/postcode/suggest?q=${encodeURIComponent(clean)}`);
        const j = await r.json();
        if (j.ok) setSugg({ q: clean, list: (j.suggestions ?? []).map((s: { code: string }) => s.code).slice(0, 8) });
      } catch { /* suggestions are optional */ }
    }, 250);
    return () => clearTimeout(t);
  }, [postcode]);

  const typed = postcode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const suggestions = sugg.q === typed ? sugg.list : [];

  function applySuggestion(code: string) {
    const clean = postcode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const lens = [2, 2, 3, 2, 2];
    let used = 0, i = 0;
    while (i < lens.length && used + lens[i] <= clean.length) { used += lens[i]; i++; }
    const next = clean.slice(0, used) + code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-(lens[i] ?? code.length));
    setPostcode(next);
    setVerification(null);
    const p = parse(next);
    if (p instanceof Postcode) check(p.toString());
  }

  async function improveGps() {
    pinnedByHand.current = false;
    setRefining(true);
    setGpsMsg("Getting a precise GPS fix… stand still with a clear view of the sky.");
    try {
      const best = await refineFix((f) => {
        setFix(f);
        if (pinnedByHand.current) return;
        setPin({ lat: f.lat, lng: f.lng });
        setAccuracy(f.accuracy);
      }, 8, 25000);
      setGpsMsg(`Done. Accuracy about ±${Math.round(best.accuracy)} m. Drag the pin onto the exact spot if needed.`);
    } catch (e) {
      setGpsMsg((e as Error).message);
    } finally {
      setRefining(false);
    }
  }

  async function submit() {
    setError("");
    if (!pin) return setError("Place the pin first.");
    setSaving(true);
    try {
      const r = await fetch("/api/places", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postcode, kind, label, directions, landmark, phone, lat: pin.lat, lng: pin.lng, accuracy_m: accuracy, consent }),
      });
      const j = await r.json();
      if (!j.ok) { setError(j.error); return; }
      try {
        saveOwned({ slug: j.place.slug, display: j.place.display, label: j.place.label, token: j.owner_token, created_at: j.place.created_at });
      } catch {
        window.prompt("This browser could not save your edit key. Copy it now — you need it to edit or delete this Placepoint:", j.owner_token);
      }
      router.push(`/p/${j.place.slug}?created=1`);
    } catch {
      setError("Network problem. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const stepper = (
    <ol className="mt-6 flex gap-2 text-xs font-semibold">
      {["Building postcode", "Pin the spot", "Details"].map((s, i) => (
        <li key={s} className={`flex-1 rounded-full px-3 py-2 text-center ${step === i + 1 ? "bg-brand text-white" : step > i + 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  );

  return (
    <div>
      {stepper}

      {step === 1 && (
        <section className="card mt-4 space-y-4">
          <div>
            <h2 className="font-semibold">Which building are you in?</h2>
            <p className="text-sm text-slate-600">Every building in Nigeria has an 11-character NIPOST postcode, e.g. <span className="font-mono">FC-03-B06-AG-12</span>.</p>
          </div>
          <button type="button" className="btn-primary w-full" onClick={locate} disabled={locating}>
            {locating ? "Finding your building…" : "Use my location to find my postcode"}
          </button>
          <div className="relative">
            <label className="label" htmlFor="pc">Or type your postcode</label>
            <input
              id="pc"
              className="input font-mono uppercase tracking-wider"
              placeholder="FC-03-B06-AG-12"
              value={postcode}
              autoComplete="off"
              onChange={(e) => { setPostcode(e.target.value); setVerification(null); setPcMsg(""); }}
              onBlur={() => { if (valid && lastChecked.current !== parsed.toString()) check(parsed.toString()); }}
            />
            {suggestions.length > 0 && !valid && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono text-sm hover:border-brand" onClick={() => applySuggestion(s)}>{s}</button>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Don&apos;t know it? Look it up at <a className="underline" href="https://postcode.gov.ng" target="_blank" rel="noreferrer">postcode.gov.ng</a> or in the NIPOST app.
            </p>
          </div>

          {nearby.length > 1 && (
            <div>
              <p className="label">Buildings near you</p>
              <div className="flex flex-wrap gap-2">
                {nearby.map((n) => (
                  <button key={n.postcode} type="button"
                    className={`rounded-lg border px-2.5 py-1.5 text-left font-mono text-sm ${postcode === n.postcode ? "border-brand bg-emerald-50" : "border-slate-300 bg-white"}`}
                    onClick={() => { setPostcode(n.postcode); check(n.postcode); }}>
                    {n.postcode}{n.distance_m != null && <span className="ml-1 font-sans text-xs text-slate-500">{formatDistance(n.distance_m)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="min-h-6 text-sm" aria-live="polite">
            {!valid && postcode.replace(/[^A-Z0-9]/gi, "").length >= 11 && <p className="text-red-600">{String(parsed)}</p>}
            {checking && <p className="text-slate-500">Checking with NIPOST…</p>}
            {verification === "verified" && <p className="font-medium text-emerald-700">✓ Confirmed by NIPOST: {postcode} is an assigned building postcode.</p>}
            {verification === "not_found" && <p className="text-red-600">NIPOST says {postcode} is not assigned to any building. Check the code.</p>}
            {pcMsg && <p className="text-amber-700">{pcMsg}</p>}
          </div>

          <button type="button" className="btn-primary w-full" disabled={!valid || checking || verification === "not_found" || verification === null}
            onClick={() => { setStep(2); if (!fix) improveGps(); }}>
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="card mt-4 space-y-4">
          <div>
            <h2 className="font-semibold">Pin the exact spot</h2>
            <p className="text-sm text-slate-600">Drag the pin, or tap the map, to put it exactly on your gate, door or shop. Satellite view helps.</p>
          </div>
          <Map center={pin ?? fix ?? NIGERIA_CENTER} zoom={pin ? 19 : 6} pin={pin} accuracy={accuracy} editable onPin={(p) => { pinnedByHand.current = true; setPin(p); setAccuracy(null); }} className="h-96" />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-ghost" onClick={improveGps} disabled={refining}>{refining ? "Improving GPS…" : "Use my current GPS position"}</button>
            {accuracy != null && <span className="text-sm text-slate-600">GPS accuracy ±{Math.round(accuracy)} m</span>}
            {accuracy == null && pin && <span className="text-sm text-emerald-700">Pin placed by hand</span>}
          </div>
          {gpsMsg && <p className="text-sm text-slate-600">{gpsMsg}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn-primary flex-1" disabled={!pin} onClick={() => setStep(3)}>Continue</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <form className="card mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <h2 className="font-semibold">Describe it</h2>
          <div>
            <label className="label" htmlFor="kind">What is this spot?</label>
            <select id="kind" className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
              {KIND_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="label">Name <span className="text-slate-400">(shown publicly)</span></label>
            <input id="label" className="input" maxLength={80} required placeholder="e.g. Blue gate, Flat 3B, Mama Nkechi Provisions" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="directions">Directions for a rider or visitor</label>
            <textarea id="directions" className="input min-h-24" maxLength={500} placeholder="e.g. Enter through the black gate, second building on the left, ground floor." value={directions} onChange={(e) => setDirections(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="landmark">Nearest landmark</label>
            <input id="landmark" className="input" maxLength={120} placeholder="e.g. Opposite Total filling station" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone number <span className="text-slate-400">(optional, shown publicly so riders can call)</span></label>
            <input id="phone" className="input" inputMode="tel" placeholder="+234 801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[#008751]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I agree that the location, name, directions and any phone number I entered will be <strong>publicly visible</strong> to anyone with this Placepoint&apos;s code or link,
              as described in the <Link href="/privacy" target="_blank" className="underline">privacy notice</Link>. I can edit or delete it at any time.
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary flex-1" disabled={saving || !consent || label.trim().length < 2}>{saving ? "Creating…" : "Create my Placepoint"}</button>
          </div>
        </form>
      )}
    </div>
  );
}

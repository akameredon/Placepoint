import Link from "next/link";
import FindForm from "@/components/FindForm";

const steps = [
  { t: "Find your building", d: "We use your phone's location to get your building's official NIPOST postcode." },
  { t: "Pin the exact spot", d: "Drop the pin on your gate, door, flat or shop on a satellite map." },
  { t: "Share one code", d: "Get a short code, a link and a printable QR plate. Anyone can find you." },
];

const uses = [
  { t: "Deliveries", d: "Riders arrive at the right gate the first time — no more \"I'm at the junction, where are you?\"" },
  { t: "Emergencies", d: "Ambulance, fire and police crews get a precise pin and directions, not just a street name." },
  { t: "Utilities & field work", d: "Meter readers, installers and agents find the exact door within large compounds and estates." },
  { t: "Markets & estates", d: "Every shop, stall or flat inside one building gets its own findable point." },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-b from-emerald-50 to-transparent">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-14">
          <p className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Built on Nigeria&apos;s NIPOST digital postcode
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your postcode finds the building. <span className="text-brand">Placepoint finds the door.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            One NIPOST postcode can cover a whole compound, estate or market. Placepoint adds the exact gate, flat or shop on top of it,
            so riders, ambulances and visitors stop calling for directions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/new" className="btn-primary px-6 text-base">Create my Placepoint — free</Link>
            <Link href="/developers" className="btn-ghost px-6 text-base">For businesses &amp; developers</Link>
          </div>
          <div className="card relative mt-10 max-w-xl">
            <p className="mb-2 text-sm font-medium text-slate-700">Got a Placepoint code or postcode? Find it:</p>
            <FindForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="card">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">{i + 1}</div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="card">
          <h2 className="text-xl font-bold">What a Placepoint code looks like</h2>
          <p className="mt-3 font-mono text-2xl font-bold tracking-wider sm:text-3xl">
            <span className="text-slate-900">FC-03-B06-AG-12</span> <span className="text-slate-400">·</span> <span className="text-brand">7K</span>
          </p>
          <p className="mt-3 text-sm text-slate-600">
            The first part is the official 11-character NIPOST postcode of the building, confirmed with NIPOST&apos;s API.
            The last two characters pick out one exact spot inside it — a gate, a flat, a shop.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="text-2xl font-bold">Who it&apos;s for</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {uses.map((u) => (
            <div key={u.t} className="card">
              <h3 className="font-semibold">{u.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{u.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate-500">
          Your data is handled under the Nigeria Data Protection Act 2023. See our <Link className="underline" href="/privacy">privacy notice</Link>.
        </p>
      </section>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Not found</h1>
      <p className="mt-2 text-slate-600">That Placepoint or postcode doesn&apos;t exist, or it was deleted by its owner.</p>
      <Link href="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}

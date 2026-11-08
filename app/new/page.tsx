import type { Metadata } from "next";
import NewPlace from "./NewPlace";

export const metadata: Metadata = { title: "Create your Placepoint" };

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Create your Placepoint</h1>
      <p className="mt-1 text-slate-600">Takes about a minute. Stand at the spot you want to pin for the best accuracy.</p>
      <NewPlace />
    </div>
  );
}

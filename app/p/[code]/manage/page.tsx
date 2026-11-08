import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPlace } from "@/lib/load";
import Manage from "./Manage";

export const metadata: Metadata = { title: "Manage Placepoint", robots: { index: false } };

export default async function Page({ params }: PageProps<"/p/[code]/manage">) {
  const place = await loadPlace((await params).code);
  if (!place) notFound();
  return <Manage place={place} />;
}

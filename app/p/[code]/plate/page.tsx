import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPlace } from "@/lib/load";
import { requestOrigin } from "@/lib/origin";
import Plate from "./Plate";

export const metadata: Metadata = { title: "Print QR plate", robots: { index: false } };

export default async function Page({ params }: PageProps<"/p/[code]/plate">) {
  const place = await loadPlace((await params).code);
  if (!place) notFound();
  return <Plate place={place} url={`${await requestOrigin()}/p/${place.slug}`} />;
}

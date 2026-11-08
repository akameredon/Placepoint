import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { loadPlace } from "@/lib/load";
import { countView, KIND_LABELS } from "@/lib/places";
import { requestOrigin } from "@/lib/origin";
import PlaceView from "./PlaceView";

export async function generateMetadata({ params }: PageProps<"/p/[code]">): Promise<Metadata> {
  const place = await loadPlace((await params).code);
  if (!place) return { title: "Placepoint not found" };
  const description = `${KIND_LABELS[place.kind]} at NIPOST postcode ${place.postcode}. ${place.directions}`.slice(0, 200);
  return {
    title: `${place.label} · ${place.display}`,
    description,
    
    openGraph: { title: `${place.label} — ${place.display}`, description },
    robots: { index: false },
  };
}

export default async function Page({ params, searchParams }: PageProps<"/p/[code]">) {
  const place = await loadPlace((await params).code);
  if (!place) notFound();
  const created = (await searchParams).created === "1";
  if (!created) after(() => countView(place.code));
  return <PlaceView place={place} url={`${await requestOrigin()}/p/${place.slug}`} created={created} />;
}

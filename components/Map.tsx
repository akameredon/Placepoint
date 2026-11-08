"use client";

import dynamic from "next/dynamic";
import type { MapProps } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="flex h-80 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">Loading map…</div>,
});

export default function Map(props: MapProps) {
  return <LeafletMap {...props} />;
}

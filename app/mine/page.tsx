import type { Metadata } from "next";
import Mine from "./Mine";

export const metadata: Metadata = { title: "My places", robots: { index: false } };

export default function Page() {
  return <Mine />;
}

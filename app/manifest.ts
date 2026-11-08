import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Placepoint",
    short_name: "Placepoint",
    description: "Your exact gate, door or shop on top of your NIPOST postcode.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#008751",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

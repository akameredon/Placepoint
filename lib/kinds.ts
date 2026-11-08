export const KINDS = ["gate", "door", "flat", "shop", "office", "stall", "other"] as const;
export type Kind = (typeof KINDS)[number];

export const KIND_LABELS: Record<Kind, string> = {
  gate: "Gate / main entrance",
  door: "Door",
  flat: "Flat / apartment",
  shop: "Shop",
  office: "Office",
  stall: "Market stall",
  other: "Other",
};

export interface PublicPlace {
  code: string;
  slug: string;
  display: string;
  postcode: string;
  suffix: string;
  nipost_status: string;
  kind: Kind;
  label: string;
  directions: string;
  landmark: string;
  phone: string | null;
  lat: number;
  lng: number;
  accuracy_m: number | null;
  views: number;
  created_at: string;
  updated_at: string;
}

import { z } from "zod";
import { compactCode, displayCode, parsePlaceCode, slugCode, type PlaceCode } from "./code";
import { db } from "./db";

import { KINDS, type Kind, type PublicPlace } from "./kinds";

export { KINDS, KIND_LABELS, type Kind, type PublicPlace } from "./kinds";

const text = (max: number) => z.string().trim().max(max);

export const placeInput = z.object({
  postcode: z.string().min(1),
  kind: z.enum(KINDS),
  label: text(80).min(2, "Give the place a short name"),
  directions: text(500).default(""),
  landmark: text(120).default(""),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,16}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  lat: z.number().min(4).max(14.5),
  lng: z.number().min(2.5).max(15),
  accuracy_m: z.number().min(0).max(100000).nullable().optional(),
  consent: z.literal(true, { message: "You must agree to the privacy notice" }),
});

export const placeUpdate = placeInput
  .omit({ postcode: true, consent: true })
  .extend({ directions: text(500), landmark: text(120) })
  .partial();

interface Row {
  code: string;
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
  created_at: Date;
  updated_at: Date;
  owner_token_hash: string;
}

export function toPublic(row: Row): PublicPlace {
  const pc = parsePlaceCode(row.code)!;
  return {
    code: row.code,
    slug: slugCode(pc),
    display: displayCode(pc),
    postcode: pc.postcode.toString(),
    suffix: row.suffix,
    nipost_status: row.nipost_status,
    kind: row.kind,
    label: row.label,
    directions: row.directions,
    landmark: row.landmark,
    phone: row.phone,
    lat: row.lat,
    lng: row.lng,
    accuracy_m: row.accuracy_m,
    views: row.views,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function findPlace(pc: PlaceCode): Promise<Row | null> {
  const pool = await db();
  const { rows } = await pool.query<Row>("SELECT * FROM places WHERE code = $1", [compactCode(pc)]);
  return rows[0] ?? null;
}

export async function countView(code: string): Promise<void> {
  const pool = await db();
  await pool.query("UPDATE places SET views = views + 1 WHERE code = $1", [code]);
}

export async function placesAtPostcode(postcodeCompact: string): Promise<PublicPlace[]> {
  const pool = await db();
  const { rows } = await pool.query<Row>(
    "SELECT * FROM places WHERE postcode = $1 ORDER BY created_at ASC LIMIT 100",
    [postcodeCompact],
  );
  return rows.map(toPublic);
}

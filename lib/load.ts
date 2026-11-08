import { cache } from "react";
import { parsePlaceCode } from "./code";
import { findPlace, toPublic, type PublicPlace } from "./places";

export const loadPlace = cache(async (slug: string): Promise<PublicPlace | null> => {
  const pc = parsePlaceCode(decodeURIComponent(slug));
  if (!pc) return null;
  const row = await findPlace(pc);
  return row ? toPublic(row) : null;
});

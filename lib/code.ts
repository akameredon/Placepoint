import { Postcode, parse } from "ng-postcode-js";

export const SUFFIX_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const SUFFIX_LENGTH = 2;

export interface PlaceCode {
  postcode: Postcode;
  suffix: string;
}

/** Stored form: compact postcode + suffix, e.g. `FC03B06AG127K`. */
export function compactCode(c: PlaceCode): string {
  return c.postcode.compact + c.suffix;
}

/** URL form, e.g. `FC03B06AG12-7K`. */
export function slugCode(c: PlaceCode): string {
  return `${c.postcode.compact}-${c.suffix}`;
}

/** Human form, e.g. `FC-03-B06-AG-12 · 7K`. */
export function displayCode(c: PlaceCode): string {
  return `${c.postcode.toString()} · ${c.suffix}`;
}

function normaliseSuffix(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[IL]/g, "1").replace(/O/g, "0");
  if (s.length !== SUFFIX_LENGTH) return null;
  for (const ch of s) if (!SUFFIX_ALPHABET.includes(ch)) return null;
  return s;
}

/** Accepts any of the forms above, case and separator insensitive. */
export function parsePlaceCode(text: string): PlaceCode | null {
  const clean = String(text).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length !== 11 + SUFFIX_LENGTH) return null;
  const postcode = parse(clean.slice(0, 11));
  if (!(postcode instanceof Postcode)) return null;
  const suffix = normaliseSuffix(clean.slice(11));
  if (!suffix) return null;
  return { postcode, suffix };
}

export function randomSuffix(random: (n: number) => number = cryptoInt): string {
  let s = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) s += SUFFIX_ALPHABET[random(SUFFIX_ALPHABET.length)];
  return s;
}

function cryptoInt(n: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

export function parsePostcode(text: string): Postcode | null {
  const p = parse(String(text ?? ""));
  return p instanceof Postcode ? p : null;
}

/** Why a postcode failed to parse, in plain words. */
export function postcodeError(text: string): string | null {
  const p = parse(String(text ?? ""));
  return p instanceof Postcode ? null : String(p);
}

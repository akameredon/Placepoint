import type { Postcode } from "ng-postcode-js";
import { ApiError, autocomplete, lookup, nearby, reverse } from "ng-postcode-js/api";
import { Client, TransportError } from "ng-postcode-js/client";
import { mockFetch } from "./nipost-mock";

export type NipostMode = "live" | "test" | "mock" | "off";

function apiKey(): string | undefined {
  return process.env.NIPOST_API_KEY || process.env.NG_POSTCODE_API_KEY || undefined;
}

export function nipostMode(): NipostMode {
  if (process.env.NIPOST_MOCK === "1") return "mock";
  const key = apiKey();
  if (!key) return "off";
  return key.includes("_test_") ? "test" : "live";
}

function client(): Client | null {
  const mode = nipostMode();
  if (mode === "off") return null;
  if (mode === "mock") return new Client("nipost_test_mock", { fetch: mockFetch });
  return new Client(apiKey()!, { baseUrl: process.env.NIPOST_BASE_URL || undefined });
}

export type Failure = { ok: false; status: number; error: string };
export type Result<T> = { ok: true; data: T } | Failure;

function explain(e: ApiError | TransportError): Failure {
  if (e instanceof TransportError) return { ok: false, status: 502, error: "Could not reach NIPOST. Please try again." };
  const byCode: Record<string, string> = {
    auth_required: "The NIPOST API key is missing.",
    invalid_api_key: "The NIPOST API key is invalid or revoked.",
    level_not_granted: "This NIPOST key is not allowed to do that.",
    insufficient_credits: "NIPOST credits have run out.",
  };
  const status = e.status === 429 ? 429 : 502;
  return { ok: false, status, error: byCode[e.code] ?? `NIPOST error: ${e.code}` };
}

async function send<T>(req: Parameters<Client["send"]>[0] & { read: (d: unknown) => T | undefined }): Promise<Result<T>> {
  const c = client();
  if (!c) return { ok: false, status: 503, error: "NIPOST lookup is not configured yet." };
  const res = (await c.send(req)) as T | ApiError | TransportError;
  if (res instanceof ApiError || res instanceof TransportError) return explain(res);
  return { ok: true, data: res };
}

export type Verification = "verified" | "not_found" | "unverified";

/** Free level-1 (Postcode Validator) lookup. */
export async function verifyPostcode(code: Postcode): Promise<{ verification: Verification; detail?: string }> {
  const r = await send(lookup(code, 1));
  if (!r.ok) return { verification: "unverified", detail: r.error };
  return { verification: r.data.valid ? "verified" : "not_found", detail: r.data.status ?? undefined };
}

export const suggest = (partial: string) => send(autocomplete(partial));
export const reverseGeocode = (lat: number, lng: number, maxDistanceM = 50) => send(reverse({ lat, lng }, maxDistanceM));
export const nearbyBuildings = (lat: number, lng: number, radiusM = 100) => send(nearby({ lat, lng }, radiusM));

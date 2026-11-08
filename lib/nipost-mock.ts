/**
 * Offline stand-in for api.postcode.gov.ng, used only when NIPOST_MOCK=1.
 * Answers in the documented envelope so the real decoder is exercised.
 */
const KNOWN: Record<string, { lat: number; lng: number; state: string; lga: string; address: string }> = {
  FC01A01KP27: { lat: 9.0579, lng: 7.4951, state: "FEDERAL CAPITAL TERRITORY", lga: "ABUJA MUNICIPAL", address: "PUBLIC BUILDING, CENTRAL AREA, ABUJA" },
  FC01A01LR01: { lat: 9.0563, lng: 7.4986, state: "FEDERAL CAPITAL TERRITORY", lga: "ABUJA MUNICIPAL", address: "PUBLIC BUILDING, CENTRAL AREA, ABUJA" },
  FC03B06AG12: { lat: 9.0765, lng: 7.3986, state: "FEDERAL CAPITAL TERRITORY", lga: "BWARI", address: "PLOT 12, AG CLOSE, ABUJA" },
  LA11W06TC10: { lat: 6.4541, lng: 3.3947, state: "LAGOS", lga: "LAGOS ISLAND", address: "10 MARINA ROAD, LAGOS ISLAND" },
  KN31F82WJ80: { lat: 12.0022, lng: 8.592, state: "KANO", lga: "FAGGE", address: "SABON GARI, KANO" },
};

function display(compact: string) {
  return `${compact.slice(0, 2)} ${compact.slice(2, 4)} ${compact.slice(4, 7)} ${compact.slice(7, 9)} ${compact.slice(9)}`;
}
function dashed(compact: string) {
  return display(compact).replace(/ /g, "-");
}
function metres(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const mockFetch: typeof fetch = async (input) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
  const q = url.searchParams;
  const ok = (data: unknown) => new Response(JSON.stringify({ data }), { status: 200, headers: { "content-type": "application/json" } });

  if (url.pathname === "/v1/lookup") {
    const code = (q.get("code") ?? "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const hit = KNOWN[code];
    return ok({ postcode: dashed(code), valid: Boolean(hit), status: hit ? "valid" : "not_found" });
  }
  if (url.pathname === "/v1/search/autocomplete") {
    const prefix = (q.get("q") ?? "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const codes = Object.keys(KNOWN).filter((c) => c.startsWith(prefix));
    return ok({ segment: "unit", suggestions: codes.map((c) => ({ code: c.slice(9) , label: dashed(c) })) });
  }
  if (url.pathname === "/v1/search/reverse" || url.pathname === "/v1/search/nearby") {
    const at = { lat: Number(q.get("lat")), lng: Number(q.get("lng")) };
    const ranked = Object.entries(KNOWN)
      .map(([c, v]) => ({ c, v, d: metres(at, v) }))
      .sort((a, b) => a.d - b.d);
    if (url.pathname === "/v1/search/nearby") {
      return ok(ranked.filter((x) => x.d <= 300).map((x) => ({ postcode: dashed(x.c), display: display(x.c), distance_m: Math.round(x.d) })));
    }
    // The mock snaps to the nearest sample building anywhere so demos work from any location.
    const best = ranked[0];
    return ok({
      found: true,
      coordinate: [at.lng, at.lat],
      unit: { postcode: dashed(best.c), display: display(best.c), distance_m: Math.round(best.d), confidence: best.d < 25 ? "high" : "low" },
      area: dashed(best.c).slice(0, 12),
      district: dashed(best.c).slice(0, 9),
      state: best.c.slice(0, 2),
      radius_m: 25,
    });
  }
  return new Response(JSON.stringify({ error: { code: "not_found", message: "mock has no such route" } }), { status: 404 });
};

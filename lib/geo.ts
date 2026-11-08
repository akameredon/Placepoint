export interface Fix {
  lat: number;
  lng: number;
  accuracy: number;
}

export function getFix(timeoutMs = 20000): Promise<Fix> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("This device has no GPS / location support."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) =>
        reject(
          new Error(
            e.code === e.PERMISSION_DENIED
              ? "Location permission was denied. Allow location for this site, or place the pin by hand."
              : "Could not get your location. Try again outdoors, or place the pin by hand.",
          ),
        ),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}

/** Watches GPS until accuracy is good enough or time runs out, reporting each improvement. */
export function refineFix(onUpdate: (f: Fix) => void, targetM = 10, maxMs = 25000): Promise<Fix> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("This device has no GPS / location support."));
    let best: Fix | null = null;
    const finish = () => {
      navigator.geolocation.clearWatch(id);
      clearTimeout(timer);
      if (best) resolve(best);
      else reject(new Error("Could not get your location. Try again outdoors, or place the pin by hand."));
    };
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const f = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
        if (!best || f.accuracy < best.accuracy) {
          best = f;
          onUpdate(f);
        }
        if (f.accuracy <= targetM) finish();
      },
      (e) => {
        if (e.code === e.PERMISSION_DENIED) {
          navigator.geolocation.clearWatch(id);
          clearTimeout(timer);
          reject(new Error("Location permission was denied. Allow location for this site, or place the pin by hand."));
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: maxMs },
    );
    const timer = setTimeout(finish, maxMs);
  });
}

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export const NIGERIA_CENTER = { lat: 9.0765, lng: 7.3986 };

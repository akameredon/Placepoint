# Placepoint

**Your NIPOST postcode finds the building. Placepoint finds the door.**

Placepoint adds the exact gate, door, flat, shop or stall on top of a building's official
[NIPOST digital postcode](https://postcode.gov.ng). Anyone gets a short code
(`FC-03-B06-AG-12 · 7K`), a share link and a printable QR plate; riders, ambulances and visitors
open it to see a satellite map pin, written directions, a Navigate button and WhatsApp share.

Built for the [Built on Nigeria's Postcode](https://pitch.postcode.gov.ng) programme.

## Features

- Find your building's postcode from GPS (NIPOST reverse + nearby search) or by typing it with
  segment autocomplete; every postcode is confirmed with NIPOST's free level-1 validator.
- Pin the exact entrance on a satellite/street map using high-accuracy GPS, then drag to adjust.
- Share page with Navigate (Google Maps), WhatsApp, native share, call and distance-to-you.
- Printable QR plate for gates and doors.
- No accounts: a one-time edit key is stored on the creator's device (only its SHA-256 hash is stored server-side) for editing and permanent deletion.
- Public read-only JSON API with CORS for logistics, e-commerce and emergency services (`/developers`).
- NDPA 2023: explicit consent before publishing, privacy notice, right to erasure, hashed IPs, no tracking cookies.
- Installable PWA, Postgres-backed rate limiting, security headers.

## How the code works

| Code | Meaning |
| --- | --- |
| `FC-03-B06-AG-12` | Official NIPOST building postcode (state, LGA, district, area, unit) |
| `7K` | Placepoint suffix: one exact point inside that building (unambiguous alphabet, no I/L/O/U) |

Accepted forms: `FC-03-B06-AG-12 · 7K`, `FC03B06AG12-7K` (URL), `FC03B06AG127K` (stored).

## Run locally

```bash
cp .env.example .env.local     # set DATABASE_URL; NIPOST_MOCK=1 for demo data without a key
npm install
npm run dev
```

The schema is created automatically on first request. A local Postgres:
`docker run -d -e POSTGRES_USER=pp -e POSTGRES_PASSWORD=pp -e POSTGRES_DB=placepoint -p 5432:5432 postgres:16-alpine`.

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Deploy (Vercel)

1. Import the repo in Vercel.
2. Add a Postgres database (Neon via Vercel Marketplace sets `DATABASE_URL`/`POSTGRES_URL`).
3. Set `NIPOST_API_KEY`, `IP_HASH_SALT` and `NEXT_PUBLIC_SITE_URL`.
4. Deploy, then check `/api/health` returns `{"ok":true,"database":"ok","nipost":"live"}`.

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/v1/places/{code}` | Resolve one Placepoint |
| `GET /api/v1/postcodes/{postcode}/places` | Placepoints in a building |
| `GET /api/health` | Database and NIPOST status |

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

## Deploy (Cloudflare Workers)

Runs on Workers through the [OpenNext adapter](https://opennext.js.org/cloudflare). Config: `wrangler.jsonc`, `open-next.config.ts`.

1. Create a hosted Postgres database (e.g. Neon) and copy its connection string.
2. Cloudflare dashboard → Workers & Pages → Create → Import a repository → pick this repo.
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
   - Build variable: `NEXT_PUBLIC_SITE_URL` (your public URL)
3. Worker → Settings → Variables and Secrets: add `DATABASE_URL`, `NIPOST_API_KEY` and `IP_HASH_SALT` as secrets.
4. Deploy, then check `/api/health` returns `{"ok":true,"database":"ok","nipost":"live"}`.

From a terminal instead: `npx wrangler login`, `npx wrangler secret put DATABASE_URL` (and the others), then `npm run cf:deploy`.
Preview the Workers build locally with `npm run cf:preview` (reads `.dev.vars`; see `.dev.vars.example`).

The standard `next build` output also still deploys to Vercel or any Node host.

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/v1/places/{code}` | Resolve one Placepoint |
| `GET /api/v1/postcodes/{postcode}/places` | Placepoints in a building |
| `GET /api/health` | Database and NIPOST status |

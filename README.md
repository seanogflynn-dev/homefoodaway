# HomeFoodAway

A locator for Ireland-origin food and products: search a product and a city, see where it's actually
been spotted on shelves, and report or confirm sightings yourself. See `/docs` in the HomeFoodAway
project for the competitive research and full v1 build plan this scaffold implements.

## What's here

- **Next.js 16** (App Router, TypeScript, Tailwind 4)
- **Supabase** (Postgres + auth + row-level security) for data — schema in `supabase/migrations/0001_init.sql`, seed data in `supabase/seed.sql`
- **Mapbox GL JS** for the map view
- A **demo mode**: with no Supabase/Mapbox env vars set, the app runs against the seed data in `src/lib/mockData.ts` so you can browse the whole UI immediately

The seed content is one real launch city (New York City) with four real, published Irish specialty
stores (sourced from public listings — see the competitive research doc for citations) and a
starter list of ~12 well-known Irish product brands. Treat the coordinates as approximate
placeholders and the "sightings" as illustrative, not verified live inventory — re-check every
address and confirm stock in person before this goes live (see the cold-start section of the build
plan).

## Running it locally right now (demo mode)

No setup required:

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll see the seed data, search, and city/product pages working.
Signing in, reporting sightings, and the map are disabled until you connect Supabase and Mapbox
(the UI tells you so wherever that applies).

## Connecting real services

### 1. Supabase (data + auth)

1. Create a free project at [supabase.com](https://supabase.com) (free tier: 500MB database, 50k
   monthly active users — plenty for a single-city launch).
2. In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`
   if you want the starter data (or skip it and add your own city from scratch).
3. In your Supabase project settings → API, copy the Project URL and the `anon` public key.
4. Copy `.env.local.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. In Supabase Authentication settings, make sure "Email" auth is enabled (it is by default) —
   that's what powers the magic-link sign-in.

### 2. Mapbox (map view)

1. Create a free account at [mapbox.com](https://mapbox.com) (free tier: 50,000 map loads/month,
   100,000 geocoding requests/month).
2. Copy your default public token from your account's Tokens page.
3. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=...
   ```

Restart `npm run dev` after adding either — the app picks up real data and the map automatically
once the env vars are present.

## Deploying

The intended path is [Vercel](https://vercel.com) (built by the makers of Next.js, generous free
tier for a pre-revenue v1):

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same three env vars from `.env.local` in the Vercel project settings.
4. Deploy — Vercel builds and hosts the app; Supabase and Mapbox stay external services either way.

## Extending the seed data

- **New products**: add a row to the `products` table (or `src/lib/mockData.ts` for demo mode) —
  `name`, `brand`, `category`, and a unique `slug`.
- **New locations**: either use the in-app "Report a sighting → New store" form once you're signed
  in (this is the real crowdsourcing flow), or insert directly into `locations` for seeding a new
  launch city ahead of time. Use the Google Places API to get accurate coordinates rather than
  guessing them.
- **New cities**: just add locations with a new `city_slug` — city pages and the search dropdown
  pick this up automatically, no code changes needed.

## Project structure

```
src/
  app/
    page.tsx                        Home page (search)
    [citySlug]/page.tsx              City index — all tracked products
    [citySlug]/[productSlug]/page.tsx  Core page: sightings + map + report form
    login/page.tsx                   Magic-link sign-in
    auth/callback/route.ts           Supabase auth redirect handler
  components/                        UI components (map, forms, header auth)
  lib/
    data.ts                          Read queries (Supabase or mock fallback)
    actions.ts                       Write server actions (sighting CRUD)
    mockData.ts                      Demo-mode seed data
    supabase/                        Supabase client setup (browser/server/proxy)
  proxy.ts                           Session-refresh proxy (Next.js 16's renamed middleware)
supabase/
  migrations/0001_init.sql           Full schema + RLS policies
  seed.sql                           Seed data matching mockData.ts
```

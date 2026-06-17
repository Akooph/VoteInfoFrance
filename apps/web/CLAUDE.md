# apps/web — Next.js Web App Index

See [README.md](README.md) for full route documentation.

## Route structure

```
app/
  layout.tsx                          ← Root layout + global CSS
  page.tsx                            ← Redirects to /dashboard
  globals.css                         ← Tailwind + CSS variables
  (landing)/                          ← Static export → GitHub Pages
    page.tsx                          ← Product landing page
    layout.tsx
  (app)/                              ← SSR web app (auth required)
    dashboard/page.tsx                ← Proposition feed
    proposition/[id]/page.tsx         ← Detail + voting + tally
    map/page.tsx                      ← Choropleth map (MapLibre)
middleware.ts                         ← Auth protection for (app)/* routes
```

## Key libs

```
lib/
  supabase.ts           ← Browser Supabase client (used in 'use client' components)
  supabase-server.ts    ← Server Supabase client (RSC + middleware)
  api-client.ts         ← Typed wrappers for all NestJS API endpoints
components/
  map/france-map.tsx    ← MapLibre choropleth (dynamically imported, no SSR)
```

## Adding a new page

1. Create `app/(app)/your-page/page.tsx` (auth protected) or `app/your-page/page.tsx` (public)
2. The `middleware.ts` already protects all `(app)/*` routes
3. Use `lib/api-client.ts` for data fetching
4. Use `lib/supabase.ts` for auth state in client components

## Building the GitHub Pages landing page

```bash
NEXT_LANDING_ONLY=true pnpm --filter @vif/web build
# Output: apps/web/out-landing/
# Deployed by .github/workflows/deploy-landing.yml
```

## MapLibre note

`components/map/france-map.tsx` must be imported with `dynamic(..., { ssr: false })` because
MapLibre GL JS requires `window` and cannot run on the server.
The France GeoJSON file must be present at `public/geo/departements.geojson`.
Download from: https://github.com/gregoiredavid/france-geojson

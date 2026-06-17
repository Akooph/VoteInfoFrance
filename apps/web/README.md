# @vif/web — Next.js Web App

The VoteInfoFrance web application. Runs on port 3001 in dev.

## Route Map

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Redirects to `/dashboard` |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Proposition feed filtered by user's geo levels |
| `/proposition/[id]` | `app/(app)/proposition/[id]/page.tsx` | Full proposition detail with voting UI |
| `/map` | `app/(app)/map/page.tsx` | France choropleth map (requires `?propositionId=`) |
| `/sign-in` | `app/sign-in/page.tsx` | Supabase Auth sign-in |
| `/sign-up` | `app/sign-up/page.tsx` | Supabase Auth sign-up |
| Landing page | `app/(landing)/page.tsx` | Static product landing page → GitHub Pages |

## Key files

| File | Purpose |
|---|---|
| `lib/supabase.ts` | Browser Supabase client |
| `lib/supabase-server.ts` | Server Supabase client (RSC / middleware) |
| `lib/api-client.ts` | Typed fetch wrappers for all API endpoints |
| `middleware.ts` | Auth protection for `(app)` routes |
| `components/map/france-map.tsx` | MapLibre GL choropleth (dynamically imported, no SSR) |
| `next.config.ts` | `NEXT_LANDING_ONLY=true` switches to static export mode |

## Adding a new page

1. Create `app/(app)/your-page/page.tsx`
2. If it needs auth, the middleware already covers `(app)/*` routes
3. Add a link from the relevant nav component

## Building the GitHub Pages landing page

```bash
NEXT_LANDING_ONLY=true pnpm --filter @vif/web build
# Output in: apps/web/out-landing/
```

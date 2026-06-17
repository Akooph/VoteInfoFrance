# VoteInfoFrance — Root Index

## What this is

Civic information and voting platform for France. Users enter a ZIP code → discover legislative decisions at 5 geographic levels → read AI-summarized propositions → vote FOR/AGAINST/INFO/BLANC → results shown on interactive France map.

## Repo structure

```
apps/api      → NestJS REST API (port 3000)         → apps/api/CLAUDE.md
apps/web      → Next.js web app (port 3001)          → apps/web/CLAUDE.md
apps/mobile   → React Native Expo app                → apps/mobile/CLAUDE.md
packages/types → Shared TS interfaces + Zod schemas  → packages/types/README.md
packages/ui   → Shared UI components                 → packages/ui/README.md
packages/config → Shared ESLint, TS, Tailwind config
infra/        → Docker + Supabase migrations          → infra/supabase/CLAUDE.md
```

## Start dev

```bash
# 1. Install dependencies
pnpm install

# 2. Start local infrastructure
docker compose -f infra/docker-compose.yml up -d   # Redis
supabase start                                       # Local Supabase (needs supabase CLI)
supabase migration up                                # Apply schema

# 3. Set env vars (copy examples)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env

# 4. Seed geographic data (once)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  pnpm --filter @vif/api exec tsx ../../infra/scripts/seed-geo-data.ts

# 5. Start all apps
pnpm dev
```

## Key env vars

| App | File | Key vars |
|---|---|---|
| API | `apps/api/.env` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MISTRAL_API_KEY`, `REDIS_HOST` |
| Web | `apps/web/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` |
| Mobile | `apps/mobile/.env` | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL` |

## Common tasks

| Task | How |
|---|---|
| Add a new API endpoint | → [apps/api/CLAUDE.md](apps/api/CLAUDE.md) |
| Add a new ingestion source | → [apps/api/CLAUDE.md](apps/api/CLAUDE.md) |
| Add a new web page | → [apps/web/CLAUDE.md](apps/web/CLAUDE.md) |
| Add a new mobile screen | → [apps/mobile/CLAUDE.md](apps/mobile/CLAUDE.md) |
| Modify the DB schema | → [infra/supabase/CLAUDE.md](infra/supabase/CLAUDE.md) |
| Add/modify shared types | → [packages/types/README.md](packages/types/README.md) |

## Deployment

| App | Host | How |
|---|---|---|
| API | Fly.io (Paris region) | `fly deploy` in `apps/api/` |
| Web app | Vercel | Auto-deploy on push to `main` |
| Landing page | GitHub Pages | GitHub Actions on push to `main` |
| Mobile | Expo EAS | `eas build --platform all` |
| Database | Supabase Cloud | `supabase db push --linked` |

## Architecture decisions

- **Why Supabase?** Built-in auth + RLS + PostGIS + Realtime in one service
- **Why Mistral AI?** French-native LLM, cost ~€0.35/month at v1 scale
- **Why BullMQ?** Distributed job queue for ingestion + summarization pipelines with retry
- **Why MapLibre?** Open source, no Mapbox token, same engine on web and mobile

# @vif/api — NestJS Backend

REST API for VoteInfoFrance. Runs on port 3000 in dev. Swagger docs at `/api/v1/docs`.

## Module Map

| Module | Path | Responsibility |
|---|---|---|
| `geo` | `src/modules/geo/` | ZIP → Commune/Dept/Region lookup via Supabase PostGIS |
| `propositions` | `src/modules/propositions/` | List + fetch propositions with embedded summaries |
| `votes` | `src/modules/votes/` | Cast votes, fetch tallies, per-department map data |
| `summaries` | `src/modules/summaries/` | BullMQ processor calling Mistral API |
| `ingestion` | `src/modules/ingestion/` | Source adapters + admin trigger endpoints |
| `auth` | `src/modules/auth/` | User profile management (ZIP onboarding) |
| `scheduler` | `src/scheduler/` | `@Cron` decorators scheduling ingestion runs |

## Guards

- `SupabaseAuthGuard` — validates Supabase JWT, injects `req.user`
- `AdminApiKeyGuard` — validates `x-admin-api-key` header for admin endpoints

## Adding a new API endpoint

1. Add the method to the relevant service
2. Add the route to the relevant controller with `@ApiOperation` decorator
3. If the endpoint needs auth, add `@UseGuards(SupabaseAuthGuard)`

## Adding a new ingestion source

1. Create `src/modules/ingestion/adapters/your-source.adapter.ts` extending `BaseAdapter`
2. Implement `fetchPropositions(): Promise<NormalizedProposition[]>`
3. Add an entry to `src/modules/ingestion/source-registry.ts`
4. Wire it into `IngestionService.runAdapter()` switch
5. Add the cron schedule to `IngestionScheduler` if it uses a new schedule

## Environment variables

See `.env.example` for all required variables. All are validated at startup via Joi.

## Dev start

```bash
cp .env.example .env
# Fill in Supabase + Mistral + Redis credentials
pnpm --filter @vif/api dev
```

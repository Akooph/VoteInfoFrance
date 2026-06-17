# Supabase / Database

## Schema overview

```
regions → departements → communes → user_profiles
propositions → summaries
propositions → votes → vote_tallies (materialized view)
ingestion_runs (audit log)
```

## Running migrations

```bash
# Local dev
supabase start           # start local Supabase instance
supabase migration up    # apply all migrations

# Production
supabase link --project-ref YOUR_PROJECT_REF
supabase db push         # push local migrations to cloud
```

## Adding a new migration

1. Create `supabase/migrations/00N_description.sql` (at repo root, not infra/)
2. Number it sequentially (002_, 003_, etc.)
3. Run `supabase migration up` locally to test
4. Commit the file — CI will run `supabase db push --linked` on merge to main

## RLS conventions

- All tables have RLS enabled
- `propositions` and `summaries`: public read, service-role write only
- `votes` and `user_profiles`: user owns their own rows (`auth.uid() = user_id/id`)
- Geographic tables: public read (static reference data)

## Refreshing the vote_tallies materialized view

The `vote_tallies` view must be refreshed after votes accumulate. Trigger:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY vote_tallies;
```
This is called by the NestJS `POST /admin/tally/refresh` endpoint, which is
triggered via a Supabase Database Webhook on the `votes` table (batch mode).

## Seeding geographic data

Run once after initial migration:
```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  pnpm --filter @vif/api exec tsx ../../infra/scripts/seed-geo-data.ts
```

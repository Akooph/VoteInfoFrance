# apps/api — NestJS Backend Index

See [README.md](README.md) for full module documentation.

## Module map

```
src/
  main.ts                       ← Bootstrap: global prefix, CORS, Swagger, filters
  app.module.ts                 ← Root module: imports all feature modules
  config/
    env.validation.ts           ← Joi schema — missing vars crash at startup
    supabase.config.ts          ← Factory functions for admin/anon Supabase clients
  common/
    guards/
      supabase-auth.guard.ts    ← Validates Supabase JWT, sets req.user
      admin-api-key.guard.ts    ← Validates x-admin-api-key header
    filters/
      all-exceptions.filter.ts  ← Global error handler
    decorators/
      current-user.decorator.ts ← @CurrentUser() param decorator
  modules/
    geo/                        ← ZIP → Commune/Dept/Region lookup
    propositions/               ← Proposition list + detail
    votes/                      ← Vote casting + tally
    summaries/                  ← Mistral AI BullMQ processor
    ingestion/                  ← Source adapters + admin trigger
      source-registry.ts        ← AUTHORITATIVE list of all data sources
      adapters/
        base.adapter.ts         ← Abstract base class for all adapters
        assemblee-nationale.adapter.ts
        senat.adapter.ts
        european-parliament.adapter.ts
    auth/                       ← User profile + ZIP onboarding
  scheduler/
    ingestion.scheduler.ts      ← @Cron triggers for ingestion runs
```

## Adding a new API endpoint

1. Add method to `src/modules/<feature>/<feature>.service.ts`
2. Add route to `src/modules/<feature>/<feature>.controller.ts` with `@ApiOperation`
3. If auth required: `@UseGuards(SupabaseAuthGuard)`
4. If admin only: `@UseGuards(AdminApiKeyGuard)`

## Adding a new ingestion source

1. Create `src/modules/ingestion/adapters/your-source.adapter.ts` extending `BaseAdapter`
2. Implement `fetchPropositions(): Promise<NormalizedProposition[]>`
3. Add entry to `src/modules/ingestion/source-registry.ts`
4. Wire in `IngestionService.runAdapter()` switch statement
5. Add `@Cron` in `IngestionScheduler` if it uses a new cron schedule

## Swagger docs

Running locally at: http://localhost:3000/api/v1/docs

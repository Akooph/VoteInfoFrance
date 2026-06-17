# @vif/types

Shared TypeScript interfaces and Zod schemas for VoteInfoFrance. This package is the single source of truth for all data shapes shared across `apps/api`, `apps/web`, and `apps/mobile`.

## Contents

| File | What it defines |
|---|---|
| `geo.ts` | `GeoLevel`, `Commune`, `Departement`, `Region`, `GeoLookupResult` |
| `proposition.ts` | `Proposition`, `Institution`, `PropositionStatus`, `Summary`, `PaginatedPropositions` |
| `vote.ts` | `Vote`, `VoteOption`, `VoteTally`, `DepartmentVoteTally`, `CreateVoteBody` |
| `user.ts` | `UserProfile`, `UpdateProfileBody` |
| `ingestion.ts` | `IngestionRun`, `NormalizedProposition`, `SourceRegistryEntry` |

## Rules

- No runtime logic — only type definitions and Zod schemas.
- Every exported Zod schema has a matching TypeScript type derived via `z.infer<>`.
- When adding a field to any schema, update **all** consumers (API, web, mobile) in the same PR.

## Adding a new type

1. Create or edit the relevant file in `src/`
2. Export from `src/index.ts`
3. Run `pnpm --filter @vif/types build` to verify the build

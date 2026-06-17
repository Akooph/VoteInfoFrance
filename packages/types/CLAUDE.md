# packages/types — Shared Types Index

Single source of truth for all TypeScript interfaces and Zod schemas used across `apps/api`, `apps/web`, and `apps/mobile`.

## File index

| File | Types defined |
|---|---|
| `src/geo.ts` | `GeoLevel`, `Commune`, `Departement`, `Region`, `GeoLookupResult` |
| `src/proposition.ts` | `Proposition`, `Institution`, `PropositionStatus`, `Summary`, `PropositionListItem`, `PaginatedPropositions` |
| `src/vote.ts` | `Vote`, `VoteOption`, `VoteTally`, `DepartmentVoteTally`, `CreateVoteBody`, `UserVote` |
| `src/user.ts` | `UserProfile`, `UpdateProfileBody` |
| `src/ingestion.ts` | `IngestionRun`, `NormalizedProposition`, `SourceRegistryEntry` |

## Rules

- Zod schemas are the canonical definition. TypeScript types are derived via `z.infer<>`.
- No runtime logic in this package.
- Every schema must be exported from `src/index.ts`.

## When to update

When adding a field: update schema → run `pnpm --filter @vif/types build` → update all consumers in the same PR.

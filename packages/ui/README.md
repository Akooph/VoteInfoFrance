# @vif/ui

Shared presentational components used by both `apps/web` (Next.js) and `apps/mobile` (Expo React Native).

## Components

| Component | Purpose |
|---|---|
| `VoteBadge` | Displays a vote option (POUR/CONTRE/INFO/BLANC) as a colored badge with optional count |
| `GeoLevelBadge` | Displays the geographic level of a proposition (commune/département/région/national/européen) |
| `VoteTallyBar` | Horizontal stacked bar showing vote breakdown from a `VoteTally` object |

## Rules

- No API calls — only presentational logic.
- No framework-specific imports. Styles are inline or use a `style` prop to remain portable between web and native.
- Each component accepts only types from `@vif/types`.

## Adding a component

1. Create `src/my-component.tsx`
2. Export from `src/index.ts`
3. Run `pnpm --filter @vif/ui build`

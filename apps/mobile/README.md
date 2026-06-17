# @vif/mobile — React Native + Expo

iOS and Android app for VoteInfoFrance. Uses Expo Router for file-based navigation.

## Screen Map

| Screen | File | Description |
|---|---|---|
| Feed (tabs) | `app/(tabs)/index.tsx` | Proposition list filtered by user's geo levels |
| Map (tabs) | `app/(tabs)/map.tsx` | France choropleth map placeholder → links to proposition detail |
| Profile (tabs) | `app/(tabs)/profile.tsx` | ZIP code onboarding, sign out |
| Sign In | `app/(auth)/sign-in.tsx` | Supabase email auth |
| Sign Up | `app/(auth)/sign-up.tsx` | Supabase email auth |
| Proposition detail | `app/proposition/[id].tsx` | Summary, voting, tally |

## Key files

| File | Purpose |
|---|---|
| `lib/supabase.ts` | Supabase client with `expo-secure-store` adapter |
| `lib/api-client.ts` | Typed fetch wrappers for all API endpoints |
| `app.json` | Expo config (bundle IDs, deep link scheme: `voteinfofrance://`) |

## Dev start

```bash
cp .env.example .env
# Fill in Supabase + API URL
pnpm --filter @vif/mobile dev
# Then press i (iOS simulator) or a (Android emulator)
```

## Building for stores

```bash
eas build --platform all --profile production
eas submit --platform all
```

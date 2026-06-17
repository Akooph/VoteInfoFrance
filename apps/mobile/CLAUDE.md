# apps/mobile — Expo React Native Index

See [README.md](README.md) for full screen documentation.

## Navigation structure (Expo Router)

```
app/
  _layout.tsx                 ← Root: auth state + GestureHandlerRootView
  (auth)/
    sign-in.tsx               ← Email + password sign in
    sign-up.tsx               ← Email + password sign up
  (tabs)/
    _layout.tsx               ← Bottom tab bar (Actualités, Carte, Profil)
    index.tsx                 ← Proposition feed
    map.tsx                   ← Map placeholder (full map: Phase 6)
    profile.tsx               ← ZIP onboarding + sign out
  proposition/
    [id].tsx                  ← Proposition detail + voting + tally
```

## Key libs

```
lib/
  supabase.ts       ← Supabase client with expo-secure-store session storage
  api-client.ts     ← Typed fetch wrappers (mirrors apps/web/lib/api-client.ts)
```

## Adding a new screen

1. Create `app/path/to/screen.tsx`
2. If it needs auth, check session in `useEffect` and redirect to `/(auth)/sign-in`
3. Export a default React component
4. Add navigation link from the relevant tab or screen

## Deep linking

App scheme: `voteinfofrance://`
Configured in `app.json` → `expo.scheme`

Example: `voteinfofrance://proposition/abc-123`

## EAS Build

```bash
# Development build (for local testing)
eas build --platform all --profile development

# Production build (for store submission)
eas build --platform all --profile production
eas submit --platform all
```

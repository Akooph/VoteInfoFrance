# VoteInfoFrance

Plateforme d'information civique et de vote pour la France. Équivalent de [VoteInfo](https://voteinfo.ch) Suisse.

Entrez votre code postal → découvrez les décisions législatives à 5 niveaux géographiques → lisez des résumés IA → votez POUR / CONTRE / INFO / BLANC → visualisez les résultats sur une carte de France interactive.

## Structure du projet (monorepo Turborepo)

| App / Package | Description | Stack |
|---|---|---|
| `apps/api` | API REST backend | NestJS, Supabase, BullMQ, Mistral AI |
| `apps/web` | Application web + landing page | Next.js 15, MapLibre GL, Supabase SSR |
| `apps/mobile` | Application iOS & Android | React Native, Expo, Expo Router |
| `packages/types` | Types TypeScript partagés | Zod |
| `packages/ui` | Composants UI partagés | React |
| `packages/config` | Config ESLint / TS / Tailwind | — |
| `infra/` | Schéma BDD + Docker + scripts | PostgreSQL + PostGIS, Supabase |

## Démarrage rapide

```bash
# Prérequis : Node 22+, pnpm, Docker, Supabase CLI

pnpm install
docker compose -f infra/docker-compose.yml up -d
supabase start && supabase migration up

# Configurer les variables d'environnement
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env

# Données géographiques (une seule fois)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  pnpm --filter @vif/api exec tsx ../../infra/scripts/seed-geo-data.ts

# Démarrer tous les apps
pnpm dev
```

L'API sera disponible sur http://localhost:3000/api/v1  
La doc Swagger : http://localhost:3000/api/v1/docs  
L'application web : http://localhost:3001  

## Documentation

- [Guide de développement complet](CLAUDE.md)
- [API Backend](apps/api/README.md)
- [Application Web](apps/web/README.md)
- [Application Mobile](apps/mobile/README.md)
- [Base de données](infra/supabase/CLAUDE.md)
- [Types partagés](packages/types/README.md)

## Sources de données

- Assemblée Nationale (`data.assemblee-nationale.fr`)
- Sénat (`data.senat.fr`)
- Légifrance via API PISTE (`piste.gouv.fr`)
- Parlement Européen via HowTheyVote (`howtheyvote.eu`)
- Conseils Régionaux via `data.gouv.fr`

## Déploiement

| Service | Hébergement |
|---|---|
| API | [Fly.io](https://fly.io) (région Paris) |
| Web app | [Vercel](https://vercel.com) |
| Landing page | GitHub Pages |
| Mobile | Expo EAS → App Store & Google Play |
| Base de données | [Supabase](https://supabase.com) Cloud |

## Licence

MIT

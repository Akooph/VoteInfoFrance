#!/usr/bin/env tsx
/**
 * One-time geographic seed script.
 * Downloads regions, departments, and communes from the French government APIs
 * and populates the Supabase database.
 *
 * Usage:
 *   pnpm --filter @vif/api exec tsx ../../infra/scripts/seed-geo-data.ts
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 */

import { createClient } from '@supabase/supabase-js';

const GEO_API = 'https://geo.api.gouv.fr';
const SUPABASE_URL = process.env['SUPABASE_URL'];
const SUPABASE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type APIRegion = { code: string; nom: string };
type APIDept = { code: string; nom: string; codeRegion: string };
type APICommune = {
  code: string;
  nom: string;
  codesPostaux: string[];
  codeDepartement: string;
  centre?: { coordinates: [number, number] };
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
  return res.json() as Promise<T>;
}

async function seedRegions(): Promise<void> {
  console.log('Seeding regions...');
  const regions = await fetchJSON<APIRegion[]>(`${GEO_API}/regions?fields=code,nom`);

  const rows = regions.map((r) => ({ code: r.code, nom: r.nom }));
  const { error } = await supabase.from('regions').upsert(rows, { onConflict: 'code' });
  if (error) throw error;
  console.log(`  ✓ ${rows.length} regions seeded`);
}

async function seedDepartements(): Promise<void> {
  console.log('Seeding départements...');
  const depts = await fetchJSON<APIDept[]>(`${GEO_API}/departements?fields=code,nom,codeRegion`);

  const rows = depts.map((d) => ({ code: d.code, nom: d.nom, code_region: d.codeRegion }));
  const { error } = await supabase.from('departements').upsert(rows, { onConflict: 'code' });
  if (error) throw error;
  console.log(`  ✓ ${rows.length} départements seeded`);
}

async function seedCommunes(): Promise<void> {
  console.log('Seeding communes (this may take a while — ~35K communes)...');
  let page = 1;
  const pageSize = 1000;
  let total = 0;

  while (true) {
    const communes = await fetchJSON<APICommune[]>(
      `${GEO_API}/communes?fields=code,nom,codesPostaux,codeDepartement,centre&boost=population&limit=${pageSize}&offset=${(page - 1) * pageSize}`,
    );

    if (communes.length === 0) break;

    const rows = communes.map((c) => ({
      code_insee: c.code,
      nom: c.nom,
      code_postal: c.codesPostaux,
      code_dept: c.codeDepartement,
      geometry: c.centre
        ? `POINT(${c.centre.coordinates[0]} ${c.centre.coordinates[1]})`
        : null,
    }));

    const { error } = await supabase.from('communes').upsert(rows, { onConflict: 'code_insee' });
    if (error) throw error;

    total += communes.length;
    console.log(`  Page ${page}: ${total} communes seeded`);

    if (communes.length < pageSize) break;
    page++;
  }

  console.log(`  ✓ ${total} communes seeded total`);
}

async function main() {
  try {
    await seedRegions();
    await seedDepartements();
    await seedCommunes();
    console.log('\n✅ Geographic seed complete!');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

main();

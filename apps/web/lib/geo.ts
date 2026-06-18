import { createClient } from '@/lib/supabase';
import type { GeoLookupResult } from '@vif/types';

export async function lookupByZip(codePostal: string): Promise<GeoLookupResult> {
  const supabase = createClient();

  const { data: communes, error: cErr } = await supabase
    .from('communes')
    .select('code_insee, nom, code_postal, code_dept')
    .contains('code_postal', [codePostal])
    .limit(1);

  if (cErr) throw new Error(cErr.message);
  if (!communes || communes.length === 0) {
    throw new Error(`Code postal ${codePostal} introuvable`);
  }

  const c = communes[0]!;

  const { data: dept, error: dErr } = await supabase
    .from('departements')
    .select('code, nom, code_region')
    .eq('code', c.code_dept)
    .single();

  if (dErr || !dept) throw new Error(`Département ${c.code_dept} introuvable`);

  const { data: region, error: rErr } = await supabase
    .from('regions')
    .select('code, nom')
    .eq('code', dept.code_region)
    .single();

  if (rErr || !region) throw new Error(`Région ${dept.code_region} introuvable`);

  return {
    commune: { codeInsee: c.code_insee, nom: c.nom, codePostal: c.code_postal, codeDept: c.code_dept },
    departement: { code: dept.code, nom: dept.nom, codeRegion: dept.code_region },
    region: { code: region.code, nom: region.nom },
    national: true,
    europeen: true,
  };
}

import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';
import type { NormalizedProposition } from '@vif/types';
import { BaseAdapter } from './base.adapter';

const API_BASE = 'https://data.assemblee-nationale.fr/api/v2';

type ANDossier = {
  uid: string;
  titrePrincipal: string;
  urlDossier?: string;
  dateDepot?: string;
  dateAdoption?: string;
  etatsDossier?: { libelle?: string }[];
  textesLegislatifs?: { uid?: string; urlTexte?: string }[];
};

function mapStatus(libelle?: string): NormalizedProposition['status'] {
  if (!libelle) return 'en_cours';
  const l = libelle.toLowerCase();
  if (l.includes('adopt')) return 'adopte';
  if (l.includes('rejet')) return 'rejete';
  return 'en_cours';
}

export class AssembleeNationaleAdapter extends BaseAdapter {
  protected readonly sourceId = 'assemblee_nationale';

  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async fetchPropositions(): Promise<NormalizedProposition[]> {
    this.logger.log('Fetching dossiers from Assemblée Nationale...');

    const response = await axios.get<{ dossiers: { dossier: ANDossier[] } }>(
      `${API_BASE}/dossiers/legislatifs`,
      { timeout: 30000, params: { limit: 100, offset: 0 } },
    );

    const dossiers = response.data?.dossiers?.dossier ?? [];
    this.logger.log(`Fetched ${dossiers.length} dossiers`);

    return dossiers.map((d): NormalizedProposition => ({
      sourceId: d.uid,
      sourceUrl: d.urlDossier ?? `https://www.assemblee-nationale.fr/dossiers/${d.uid}`,
      institution: 'assemblee_nationale',
      titre: d.titrePrincipal,
      texteOriginal: null,
      dateDepot: d.dateDepot ?? null,
      dateVote: d.dateAdoption ?? null,
      status: mapStatus(d.etatsDossier?.[0]?.libelle),
      geoLevel: 'national',
      geoCode: null,
    }));
  }
}

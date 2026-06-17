import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';
import type { NormalizedProposition } from '@vif/types';
import { BaseAdapter } from './base.adapter';

const API_BASE = 'https://data.senat.fr/api/records/1.0/search';

type SenatRecord = {
  fields: {
    numeros_dosleg?: string;
    intitule_long?: string;
    url_dossier_senat?: string;
    date_depot?: string;
    date_adoption?: string;
    sort?: string;
  };
};

function mapStatus(sort?: string): NormalizedProposition['status'] {
  if (!sort) return 'en_cours';
  const s = sort.toLowerCase();
  if (s.includes('adopt')) return 'adopte';
  if (s.includes('rejet')) return 'rejete';
  return 'en_cours';
}

export class SenatAdapter extends BaseAdapter {
  protected readonly sourceId = 'senat';

  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async fetchPropositions(): Promise<NormalizedProposition[]> {
    this.logger.log('Fetching dossiers from Sénat...');

    const response = await axios.get<{ records: SenatRecord[] }>(API_BASE, {
      timeout: 30000,
      params: { dataset: 'dosleg', rows: 100, sort: '-date_depot' },
    });

    const records = response.data?.records ?? [];
    this.logger.log(`Fetched ${records.length} dossiers from Sénat`);

    return records
      .filter((r) => r.fields.numeros_dosleg)
      .map((r): NormalizedProposition => ({
        sourceId: r.fields.numeros_dosleg!,
        sourceUrl:
          r.fields.url_dossier_senat ??
          `https://www.senat.fr/dossier-legislatif/${r.fields.numeros_dosleg}`,
        institution: 'senat',
        titre: r.fields.intitule_long ?? r.fields.numeros_dosleg ?? 'Sans titre',
        texteOriginal: null,
        dateDepot: r.fields.date_depot ?? null,
        dateVote: r.fields.date_adoption ?? null,
        status: mapStatus(r.fields.sort),
        geoLevel: 'national',
        geoCode: null,
      }));
  }
}

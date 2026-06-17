import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';
import type { NormalizedProposition } from '@vif/types';
import { BaseAdapter } from './base.adapter';

const API_BASE = 'https://howtheyvote.eu/api';

type HtvVote = {
  id: number;
  title: string;
  timestamp: string;
  reference?: string;
  description?: string;
  is_main?: boolean;
  geo_areas?: string[];
};

export class EuropeanParliamentAdapter extends BaseAdapter {
  protected readonly sourceId = 'parlement_europeen';

  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async fetchPropositions(): Promise<NormalizedProposition[]> {
    this.logger.log('Fetching votes from HowTheyVote (European Parliament)...');

    const response = await axios.get<{ results: HtvVote[] }>(`${API_BASE}/votes`, {
      timeout: 30000,
      params: { page: 1, page_size: 100, order_by: '-timestamp' },
    });

    const votes = (response.data?.results ?? []).filter((v) => v.is_main !== false);
    this.logger.log(`Fetched ${votes.length} EP votes`);

    return votes.map((v): NormalizedProposition => ({
      sourceId: `ep_${v.id}`,
      sourceUrl: `https://howtheyvote.eu/votes/${v.id}`,
      institution: 'parlement_europeen',
      titre: v.title,
      texteOriginal: v.description ?? null,
      dateDepot: null,
      dateVote: v.timestamp ? v.timestamp.split('T')[0] ?? null : null,
      status: 'adopte',
      geoLevel: 'europeen',
      geoCode: null,
    }));
  }
}

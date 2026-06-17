import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';
import type { NormalizedProposition } from '@vif/types';
import { BaseAdapter } from './base.adapter';

const DATAGOUV_API = 'https://www.data.gouv.fr/api/1';

type DataGouvResource = {
  id: string;
  title: string;
  url: string;
  created_at?: string;
  last_modified?: string;
};

type DataGouvDataset = {
  id: string;
  title: string;
  resources: DataGouvResource[];
  organization?: { name: string };
};

/**
 * Maps known conseil régional datasets on data.gouv.fr.
 * Each entry is a dataset ID and its corresponding region code.
 * Add more region dataset IDs here as they become available.
 */
const REGION_DATASETS: Array<{ datasetId: string; regionCode: string; regionName: string }> = [
  { datasetId: 'deliberations-du-conseil-regional-ile-de-france', regionCode: '11', regionName: 'Île-de-France' },
  { datasetId: 'deliberations-conseil-regional-auvergne-rhone-alpes', regionCode: '84', regionName: 'Auvergne-Rhône-Alpes' },
  { datasetId: 'deliberations-conseil-regional-nouvelle-aquitaine', regionCode: '75', regionName: 'Nouvelle-Aquitaine' },
  { datasetId: 'deliberations-conseil-regional-occitanie', regionCode: '76', regionName: 'Occitanie' },
];

export class RegionalCouncilAdapter extends BaseAdapter {
  protected readonly sourceId = 'conseils_regionaux';

  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async fetchPropositions(): Promise<NormalizedProposition[]> {
    this.logger.log('Fetching délibérations from regional councils (data.gouv.fr)...');
    const results: NormalizedProposition[] = [];

    for (const { datasetId, regionCode, regionName } of REGION_DATASETS) {
      try {
        const props = await this.fetchDataset(datasetId, regionCode, regionName);
        results.push(...props);
      } catch (err) {
        this.logger.warn(`Failed to fetch dataset ${datasetId}: ${err}`);
      }
    }

    this.logger.log(`Fetched ${results.length} délibérations from regional councils`);
    return results;
  }

  private async fetchDataset(
    datasetId: string,
    regionCode: string,
    _regionName: string,
  ): Promise<NormalizedProposition[]> {
    const response = await axios.get<DataGouvDataset>(
      `${DATAGOUV_API}/datasets/${datasetId}/`,
      { timeout: 15_000 },
    );

    const dataset = response.data;
    const resources = dataset.resources.slice(0, 20);

    return resources.map((r): NormalizedProposition => ({
      sourceId: `regional_${regionCode}_${r.id}`,
      sourceUrl: r.url,
      institution: 'conseil_regional',
      titre: r.title || dataset.title,
      texteOriginal: null,
      dateDepot: r.created_at ? r.created_at.split('T')[0] ?? null : null,
      dateVote: r.last_modified ? r.last_modified.split('T')[0] ?? null : null,
      status: 'adopte',
      geoLevel: 'region',
      geoCode: regionCode,
    }));
  }
}

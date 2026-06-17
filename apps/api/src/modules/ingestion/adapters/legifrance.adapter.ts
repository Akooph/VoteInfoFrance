import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';
import type { NormalizedProposition } from '@vif/types';
import { BaseAdapter } from './base.adapter';

const TOKEN_URL = 'https://oauth.piste.gouv.fr/api/oauth/token';
const API_BASE = 'https://api.piste.gouv.fr/dila/legifrance/lf-engine-app';

type LegifranceText = {
  id: string;
  titre: string;
  dateTexte?: string;
  dateParution?: string;
  etat?: string;
  urlTexte?: string;
};

type LegifranceResponse = {
  results?: LegifranceText[];
  totalResultNumber?: number;
};

export class LegifranceAdapter extends BaseAdapter {
  protected readonly sourceId = 'legifrance';
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    supabase: SupabaseClient,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {
    super(supabase);
  }

  private async getToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 30_000) {
      return this.tokenCache.token;
    }

    const response = await axios.post<{ access_token: string; expires_in: number }>(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'openid',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10_000 },
    );

    this.tokenCache = {
      token: response.data.access_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
    };

    return this.tokenCache.token;
  }

  async fetchPropositions(): Promise<NormalizedProposition[]> {
    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('PISTE credentials not configured — skipping Légifrance adapter');
      return [];
    }

    this.logger.log('Fetching texts from Légifrance (PISTE API)...');
    const token = await this.getToken();

    const response = await axios.post<LegifranceResponse>(
      `${API_BASE}/search`,
      {
        recherche: {
          champs: [{ typeChamp: 'ALL', criteres: [{ typeRecherche: 'EXACTE', valeur: 'loi' }], operateur: 'ET' }],
          filtres: [{ facette: 'NATURE', valeurs: ['LOI', 'ORDONNANCE'] }],
          pageNumber: 1,
          pageSize: 50,
          sort: 'PERTINENCE',
          typePagination: 'DEFAUT',
        },
        fond: 'LEGI',
      },
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 30_000,
      },
    );

    const texts = response.data?.results ?? [];
    this.logger.log(`Fetched ${texts.length} texts from Légifrance`);

    return texts.map((t): NormalizedProposition => ({
      sourceId: t.id,
      sourceUrl: t.urlTexte ?? `https://www.legifrance.gouv.fr/loda/id/${t.id}`,
      institution: 'assemblee_nationale',
      titre: t.titre,
      texteOriginal: null,
      dateDepot: t.dateTexte ?? null,
      dateVote: t.dateParution ?? null,
      status: t.etat?.toLowerCase().includes('vigueur') ? 'adopte' : 'en_cours',
      geoLevel: 'national',
      geoCode: null,
    }));
  }
}

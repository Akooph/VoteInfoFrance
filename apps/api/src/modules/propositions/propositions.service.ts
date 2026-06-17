import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import type {
  GeoLevel,
  Institution,
  PaginatedPropositions,
  Proposition,
} from '@vif/types';
import { createSupabaseAdminClient } from '../../config/supabase.config';

type ListQuery = {
  geoLevel?: GeoLevel;
  geoCode?: string;
  status?: string;
  institution?: Institution;
  page: number;
  limit: number;
  userId?: string;
};

@Injectable()
export class PropositionsService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createSupabaseAdminClient(config);
  }

  async list(query: ListQuery): Promise<PaginatedPropositions> {
    const { geoLevel, geoCode, status, institution, page, limit, userId } = query;
    const offset = (page - 1) * limit;

    let q = this.supabase
      .from('propositions')
      .select('id, source_url, institution, titre, date_depot, date_vote, status, geo_level, geo_code, summaries(id)', { count: 'exact' });

    if (geoLevel) q = q.eq('geo_level', geoLevel);
    if (geoCode) q = q.eq('geo_code', geoCode);
    if (status) q = q.eq('status', status);
    if (institution) q = q.eq('institution', institution);

    const { data, count, error } = await q
      .order('date_depot', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const total = count ?? 0;

    const userVoteMap = new Map<string, string>();
    if (userId && data?.length) {
      const ids = data.map((r) => r.id);
      const { data: uv } = await this.supabase
        .from('votes')
        .select('proposition_id, option')
        .eq('user_id', userId)
        .in('proposition_id', ids);

      for (const v of uv ?? []) userVoteMap.set(v.proposition_id, v.option);
    }

    return {
      data: (data ?? []).map((r) => ({
        id: r.id,
        sourceUrl: r.source_url,
        institution: r.institution,
        titre: r.titre,
        dateDepot: r.date_depot,
        dateVote: r.date_vote,
        status: r.status,
        geoLevel: r.geo_level,
        geoCode: r.geo_code,
        hasSummary: Array.isArray(r.summaries) && r.summaries.length > 0,
        userVote: userVoteMap.get(r.id) ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId?: string): Promise<Proposition> {
    const { data, error } = await this.supabase
      .from('propositions')
      .select('*, summaries(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Proposition ${id} not found`);

    const summary = data.summaries?.[0] ?? null;

    return {
      id: data.id,
      sourceId: data.source_id,
      sourceUrl: data.source_url,
      institution: data.institution,
      titre: data.titre,
      texteOriginal: data.texte_original,
      dateDepot: data.date_depot,
      dateVote: data.date_vote,
      status: data.status,
      geoLevel: data.geo_level,
      geoCode: data.geo_code,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      summary: summary
        ? {
            id: summary.id,
            propositionId: summary.proposition_id,
            resume: summary.resume,
            pour: summary.pour,
            contre: summary.contre,
            modelUsed: summary.model_used,
            generatedAt: summary.generated_at,
          }
        : null,
    };
  }
}

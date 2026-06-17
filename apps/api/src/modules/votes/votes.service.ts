import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import type { CreateVoteBody, UserVote, VoteTally, DepartmentVoteTally } from '@vif/types';
import { createSupabaseAdminClient } from '../../config/supabase.config';

@Injectable()
export class VotesService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createSupabaseAdminClient(config);
  }

  async castVote(userId: string, body: CreateVoteBody): Promise<UserVote> {
    const { data: existing } = await this.supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('proposition_id', body.propositionId)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('You have already voted on this proposition');
    }

    const { data, error } = await this.supabase
      .from('votes')
      .insert({ user_id: userId, proposition_id: body.propositionId, option: body.option })
      .select('proposition_id, option, voted_at')
      .single();

    if (error) throw error;
    return { propositionId: data.proposition_id, option: data.option, votedAt: data.voted_at };
  }

  async getUserVotes(userId: string): Promise<UserVote[]> {
    const { data, error } = await this.supabase
      .from('votes')
      .select('proposition_id, option, voted_at')
      .eq('user_id', userId)
      .order('voted_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((v) => ({
      propositionId: v.proposition_id,
      option: v.option,
      votedAt: v.voted_at,
    }));
  }

  async getTally(propositionId: string): Promise<VoteTally> {
    const { data, error } = await this.supabase
      .from('votes')
      .select('option')
      .eq('proposition_id', propositionId);

    if (error) throw error;

    const tally: VoteTally = { POUR: 0, CONTRE: 0, INFO: 0, BLANC: 0, total: 0 };
    for (const v of data ?? []) {
      tally[v.option as keyof VoteTally]++;
      tally.total++;
    }
    return tally;
  }

  async getDepartmentTally(propositionId: string): Promise<DepartmentVoteTally[]> {
    const { data, error } = await this.supabase
      .from('vote_tallies')
      .select('code_dept, code_region, option, count')
      .eq('proposition_id', propositionId);

    if (error) throw error;

    const map = new Map<string, DepartmentVoteTally>();
    for (const row of data ?? []) {
      if (!map.has(row.code_dept)) {
        map.set(row.code_dept, {
          codeDept: row.code_dept,
          nomDept: row.code_dept,
          codeRegion: row.code_region,
          POUR: 0,
          CONTRE: 0,
          INFO: 0,
          BLANC: 0,
          total: 0,
        });
      }
      const entry = map.get(row.code_dept)!;
      entry[row.option as 'POUR' | 'CONTRE' | 'INFO' | 'BLANC'] += Number(row.count);
      entry.total += Number(row.count);
    }

    return Array.from(map.values());
  }
}

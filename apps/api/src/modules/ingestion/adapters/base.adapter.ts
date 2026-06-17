import { Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { NormalizedProposition } from '@vif/types';

/**
 * Abstract base class for all data source adapters.
 * Each adapter implements `fetchPropositions()` to pull from its specific source.
 * The base class handles upsert logic and tracks metrics.
 */
export abstract class BaseAdapter {
  protected abstract readonly sourceId: string;
  protected readonly logger: Logger;

  constructor(
    protected readonly supabase: SupabaseClient,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  abstract fetchPropositions(): Promise<NormalizedProposition[]>;

  async upsertPropositions(
    propositions: NormalizedProposition[],
  ): Promise<{ inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;

    for (const prop of propositions) {
      const { data: existing } = await this.supabase
        .from('propositions')
        .select('id, updated_at')
        .eq('source_id', prop.sourceId)
        .eq('institution', prop.institution)
        .maybeSingle();

      if (existing) {
        await this.supabase
          .from('propositions')
          .update({
            titre: prop.titre,
            texte_original: prop.texteOriginal,
            date_depot: prop.dateDepot,
            date_vote: prop.dateVote,
            status: prop.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        updated++;
      } else {
        await this.supabase.from('propositions').insert({
          source_id: prop.sourceId,
          source_url: prop.sourceUrl,
          institution: prop.institution,
          titre: prop.titre,
          texte_original: prop.texteOriginal,
          date_depot: prop.dateDepot,
          date_vote: prop.dateVote,
          status: prop.status,
          geo_level: prop.geoLevel,
          geo_code: prop.geoCode,
        });
        inserted++;
      }
    }

    this.logger.log(`[${this.sourceId}] Upserted ${propositions.length}: ${inserted} new, ${updated} updated`);
    return { inserted, updated };
  }
}

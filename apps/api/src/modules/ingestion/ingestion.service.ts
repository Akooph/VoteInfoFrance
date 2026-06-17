import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseAdminClient } from '../../config/supabase.config';
import { SummarizationService } from '../summaries/summarization.service';
import { SOURCE_REGISTRY } from './source-registry';
import { AssembleeNationaleAdapter } from './adapters/assemblee-nationale.adapter';
import { SenatAdapter } from './adapters/senat.adapter';
import { EuropeanParliamentAdapter } from './adapters/european-parliament.adapter';
import { LegifranceAdapter } from './adapters/legifrance.adapter';
import { RegionalCouncilAdapter } from './adapters/regional-council.adapter';
import type { IngestionRun } from '@vif/types';

type AdapterMap = Record<string, () => Promise<void>>;

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly supabase: ReturnType<typeof createSupabaseAdminClient>;

  constructor(
    private readonly config: ConfigService,
    private readonly summarization: SummarizationService,
  ) {
    this.supabase = createSupabaseAdminClient(config);
  }

  async triggerSource(sourceId: string): Promise<{ message: string }> {
    const entry = SOURCE_REGISTRY.find((s) => s.id === sourceId);
    if (!entry) throw new NotFoundException(`Unknown source: ${sourceId}`);

    const runId = await this.startRun(sourceId);

    try {
      await this.runAdapter(sourceId);
      await this.finishRun(runId, 'success', 0);
      return { message: `Ingestion triggered for ${sourceId}` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.finishRun(runId, 'error', 0, msg);
      throw err;
    }
  }

  async listRuns(): Promise<IngestionRun[]> {
    const { data, error } = await this.supabase
      .from('ingestion_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      source: r.source,
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      status: r.status,
      recordsUpserted: r.records_upserted,
      errorMessage: r.error_message,
    }));
  }

  private async runAdapter(sourceId: string): Promise<void> {
    const adapterMap: AdapterMap = {
      assemblee_nationale: () => this.runAssembleeNationale(),
      senat: () => this.runSenat(),
      parlement_europeen: () => this.runEuropeanParliament(),
      legifrance: () => this.runLegifrance(),
      conseils_regionaux: () => this.runRegionalCouncils(),
    };

    const handler = adapterMap[sourceId];
    if (!handler) {
      this.logger.warn(`No adapter implemented for source: ${sourceId}`);
      return;
    }
    await handler();
  }

  private async runAssembleeNationale(): Promise<void> {
    const adapter = new AssembleeNationaleAdapter(this.supabase);
    const props = await adapter.fetchPropositions();
    const { inserted } = await adapter.upsertPropositions(props);
    await this.enqueueNewSummarizations(props.slice(0, inserted));
  }

  private async runSenat(): Promise<void> {
    const adapter = new SenatAdapter(this.supabase);
    const props = await adapter.fetchPropositions();
    const { inserted } = await adapter.upsertPropositions(props);
    await this.enqueueNewSummarizations(props.slice(0, inserted));
  }

  private async runEuropeanParliament(): Promise<void> {
    const adapter = new EuropeanParliamentAdapter(this.supabase);
    const props = await adapter.fetchPropositions();
    const { inserted } = await adapter.upsertPropositions(props);
    await this.enqueueNewSummarizations(props.slice(0, inserted));
  }

  private async runLegifrance(): Promise<void> {
    const adapter = new LegifranceAdapter(
      this.supabase,
      this.config.get<string>('PISTE_CLIENT_ID', ''),
      this.config.get<string>('PISTE_CLIENT_SECRET', ''),
    );
    const props = await adapter.fetchPropositions();
    const { inserted } = await adapter.upsertPropositions(props);
    await this.enqueueNewSummarizations(props.slice(0, inserted));
  }

  private async runRegionalCouncils(): Promise<void> {
    const adapter = new RegionalCouncilAdapter(this.supabase);
    const props = await adapter.fetchPropositions();
    const { inserted } = await adapter.upsertPropositions(props);
    await this.enqueueNewSummarizations(props.slice(0, inserted));
  }

  private async enqueueNewSummarizations(
    props: Array<{ sourceId: string; texteOriginal: string | null }>,
  ): Promise<void> {
    for (const prop of props) {
      if (!prop.texteOriginal) continue;

      const { data } = await this.supabase
        .from('propositions')
        .select('id')
        .eq('source_id', prop.sourceId)
        .maybeSingle();

      if (data?.id) {
        await this.summarization.enqueue({
          propositionId: data.id,
          texteOriginal: prop.texteOriginal,
          sourceId: prop.sourceId,
        });
      }
    }
  }

  private async startRun(source: string): Promise<string> {
    const { data } = await this.supabase
      .from('ingestion_runs')
      .insert({ source, status: 'running' })
      .select('id')
      .single();
    return data?.id ?? '';
  }

  private async finishRun(
    id: string,
    status: 'success' | 'error',
    recordsUpserted: number,
    errorMessage?: string,
  ): Promise<void> {
    await this.supabase
      .from('ingestion_runs')
      .update({ status, records_upserted: recordsUpserted, finished_at: new Date().toISOString(), error_message: errorMessage ?? null })
      .eq('id', id);
  }
}

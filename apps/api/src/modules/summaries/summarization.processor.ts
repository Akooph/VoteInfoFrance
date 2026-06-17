import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Mistral } from '@mistralai/mistralai';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '../../config/supabase.config';
import { buildSummarizationPrompt, buildChunkSummaryPrompt } from './prompt';
import type { SummarizationJobData } from './summarization.service';
import { SUMMARIZATION_QUEUE } from './summaries.module';

const CHUNK_SIZE = 6000;
const CHUNK_OVERLAP = 2000;

@Processor(SUMMARIZATION_QUEUE, { concurrency: 10 })
export class SummarizationProcessor extends WorkerHost {
  private readonly logger = new Logger(SummarizationProcessor.name);
  private readonly supabase: SupabaseClient;
  private readonly mistral: Mistral;

  constructor(private readonly config: ConfigService) {
    super();
    this.supabase = createSupabaseAdminClient(config);
    this.mistral = new Mistral({ apiKey: config.getOrThrow('MISTRAL_API_KEY') });
  }

  async process(job: Job<SummarizationJobData>): Promise<void> {
    const { propositionId, texteOriginal, sourceId } = job.data;

    if (!this.config.get<boolean>('SUMMARIZATION_ENABLED')) {
      this.logger.warn('Summarization disabled via SUMMARIZATION_ENABLED flag');
      return;
    }

    const { data: existing } = await this.supabase
      .from('summaries')
      .select('id')
      .eq('proposition_id', propositionId)
      .maybeSingle();

    if (existing) {
      this.logger.log(`Summary already exists for ${propositionId}, skipping`);
      return;
    }

    const model = this.config.get<string>('MISTRAL_MODEL', 'mistral-small-latest');
    const result = texteOriginal.length > CHUNK_SIZE
      ? await this.summarizeInChunks(texteOriginal, model)
      : await this.callMistral(buildSummarizationPrompt(texteOriginal), model);

    const { error } = await this.supabase.from('summaries').upsert({
      proposition_id: propositionId,
      resume: result.resume,
      pour: result.pour,
      contre: result.contre,
      model_used: model,
    });

    if (error) throw error;
    this.logger.log(`Summary generated for proposition ${propositionId} (source: ${sourceId})`);
  }

  private async summarizeInChunks(
    text: string,
    model: string,
  ): Promise<{ resume: string; pour: string; contre: string }> {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + CHUNK_SIZE));
      start += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    const chunkSummaries = await Promise.all(
      chunks.map((chunk) => this.callMistral(buildSummarizationPrompt(chunk), model)),
    );

    if (chunkSummaries.length === 1) return chunkSummaries[0]!;

    return this.callMistral(
      buildChunkSummaryPrompt(chunkSummaries.map((s) => s.resume)),
      model,
    );
  }

  private async callMistral(
    prompt: string,
    model: string,
  ): Promise<{ resume: string; pour: string; contre: string }> {
    const response = await this.mistral.chat.complete({
      model,
      messages: [{ role: 'user', content: prompt }],
      responseFormat: { type: 'json_object' },
      maxTokens: this.config.get<number>('MISTRAL_MAX_TOKENS', 1500),
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('Empty Mistral response');

    const parsed = JSON.parse(content) as { resume?: string; pour?: string; contre?: string };
    if (!parsed.resume || !parsed.pour || !parsed.contre) {
      throw new Error(`Unexpected Mistral response shape: ${content}`);
    }

    return { resume: parsed.resume, pour: parsed.pour, contre: parsed.contre };
  }
}

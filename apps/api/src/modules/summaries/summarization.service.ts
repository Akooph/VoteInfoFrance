import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseAdminClient } from '../../config/supabase.config';

export type SummarizationJobData = {
  propositionId: string;
  texteOriginal: string;
  sourceId: string;
};

@Injectable()
export class SummarizationService {
  private readonly logger = new Logger(SummarizationService.name);
  private readonly supabase: ReturnType<typeof createSupabaseAdminClient>;

  constructor(private readonly config: ConfigService) {
    this.supabase = createSupabaseAdminClient(config);
  }

  // Writes a placeholder summary immediately. Swap this body for a BullMQ
  // enqueue call once Redis and Mistral are wired back in.
  async enqueue(data: SummarizationJobData): Promise<void> {
    const { error } = await this.supabase.from('summaries').upsert(
      {
        proposition_id: data.propositionId,
        resume: 'Résumé en cours de génération…',
        pour: 'Arguments en cours d\'analyse.',
        contre: 'Arguments en cours d\'analyse.',
        model_used: 'placeholder',
      },
      { onConflict: 'proposition_id', ignoreDuplicates: true },
    );
    if (error) this.logger.warn(`Placeholder summary insert failed: ${error.message}`);
  }
}

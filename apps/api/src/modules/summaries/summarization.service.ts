import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SUMMARIZATION_QUEUE } from './summaries.module';

export type SummarizationJobData = {
  propositionId: string;
  texteOriginal: string;
  sourceId: string;
};

@Injectable()
export class SummarizationService {
  private readonly logger = new Logger(SummarizationService.name);

  constructor(@InjectQueue(SUMMARIZATION_QUEUE) private readonly queue: Queue) {}

  async enqueue(data: SummarizationJobData): Promise<void> {
    await this.queue.add('summarize', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    this.logger.log(`Enqueued summarization for proposition ${data.propositionId}`);
  }
}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SummarizationProcessor } from './summarization.processor';
import { SummarizationService } from './summarization.service';

export const SUMMARIZATION_QUEUE = 'summarization';

@Module({
  imports: [
    BullModule.registerQueue({ name: SUMMARIZATION_QUEUE }),
  ],
  providers: [SummarizationProcessor, SummarizationService],
  exports: [SummarizationService],
})
export class SummariesModule {}

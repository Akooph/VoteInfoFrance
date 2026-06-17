import { Module } from '@nestjs/common';
import { SummarizationService } from './summarization.service';

export const SUMMARIZATION_QUEUE = 'summarization';

@Module({
  providers: [SummarizationService],
  exports: [SummarizationService],
})
export class SummariesModule {}

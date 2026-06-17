import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { SummariesModule } from '../summaries/summaries.module';

export const INGESTION_QUEUE = 'ingestion';

@Module({
  imports: [SummariesModule],
  providers: [IngestionService],
  controllers: [IngestionController],
  exports: [IngestionService],
})
export class IngestionModule {}

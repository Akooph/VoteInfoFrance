import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { SummariesModule } from '../summaries/summaries.module';

export const INGESTION_QUEUE = 'ingestion';

@Module({
  imports: [
    BullModule.registerQueue({ name: INGESTION_QUEUE }),
    SummariesModule,
  ],
  providers: [IngestionService],
  controllers: [IngestionController],
  exports: [IngestionService],
})
export class IngestionModule {}

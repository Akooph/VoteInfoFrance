import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IngestionService } from '../modules/ingestion/ingestion.service';
import { SOURCE_REGISTRY } from '../modules/ingestion/source-registry';

@Injectable()
export class IngestionScheduler {
  private readonly logger = new Logger(IngestionScheduler.name);

  constructor(private readonly ingestion: IngestionService) {}

  @Cron('0 */4 * * *')
  async runEvery4Hours(): Promise<void> {
    const sources = SOURCE_REGISTRY.filter((s) => s.cronSchedule === '0 */4 * * *');
    for (const source of sources) {
      this.logger.log(`Scheduled run: ${source.id}`);
      await this.ingestion.triggerSource(source.id).catch((err) =>
        this.logger.error(`Failed scheduled run for ${source.id}: ${err}`),
      );
    }
  }

  @Cron('0 */6 * * *')
  async runEvery6Hours(): Promise<void> {
    const sources = SOURCE_REGISTRY.filter((s) => s.cronSchedule === '0 */6 * * *');
    for (const source of sources) {
      this.logger.log(`Scheduled run: ${source.id}`);
      await this.ingestion.triggerSource(source.id).catch((err) =>
        this.logger.error(`Failed scheduled run for ${source.id}: ${err}`),
      );
    }
  }

  @Cron('0 6 * * *')
  async runDaily(): Promise<void> {
    const sources = SOURCE_REGISTRY.filter((s) => s.cronSchedule === '0 6 * * *' || s.cronSchedule === '0 8 * * *');
    for (const source of sources) {
      this.logger.log(`Scheduled daily run: ${source.id}`);
      await this.ingestion.triggerSource(source.id).catch((err) =>
        this.logger.error(`Failed daily run for ${source.id}: ${err}`),
      );
    }
  }
}

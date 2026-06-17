import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { envValidationSchema } from './config/env.validation';
import { GeoModule } from './modules/geo/geo.module';
import { PropositionsModule } from './modules/propositions/propositions.module';
import { VotesModule } from './modules/votes/votes.module';
import { SummariesModule } from './modules/summaries/summaries.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { AppCacheModule } from './common/cache/cache.module';
import { IngestionScheduler } from './scheduler/ingestion.scheduler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
        limit: config.get<number>('THROTTLE_LIMIT', 100),
      }],
    }),
    ScheduleModule.forRoot(),
    AppCacheModule,
    GeoModule,
    PropositionsModule,
    VotesModule,
    SummariesModule,
    IngestionModule,
    AuthModule,
    HealthModule,
  ],
  providers: [IngestionScheduler],
})
export class AppModule {}

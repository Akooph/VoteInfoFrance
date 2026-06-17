import { Module } from '@nestjs/common';
import { PropositionsController } from './propositions.controller';
import { PropositionsService } from './propositions.service';
import { VotesModule } from '../votes/votes.module';

@Module({
  imports: [VotesModule],
  controllers: [PropositionsController],
  providers: [PropositionsService],
  exports: [PropositionsService],
})
export class PropositionsModule {}

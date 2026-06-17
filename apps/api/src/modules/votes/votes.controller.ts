import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { VotesService } from './votes.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateVoteBodySchema } from '@vif/types';

@ApiTags('votes')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('votes')
export class VotesController {
  constructor(private readonly votes: VotesService) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Cast a vote on a proposition (one per user per proposition)' })
  castVote(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const parsed = CreateVoteBodySchema.parse(body);
    return this.votes.castVote(user.id, parsed);
  }

  @Get('me')
  @ApiOperation({ summary: "List the authenticated user's votes" })
  getMyVotes(@CurrentUser() user: AuthUser) {
    return this.votes.getUserVotes(user.id);
  }
}

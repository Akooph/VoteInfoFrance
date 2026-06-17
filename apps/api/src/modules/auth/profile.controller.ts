import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileBodySchema } from '@vif/types';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @ApiOperation({ summary: "Get the authenticated user's profile" })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.profile.getProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: "Update user ZIP code, triggers geo lookup and stores commune" })
  updateProfile(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const parsed = UpdateProfileBodySchema.parse(body);
    return this.profile.updateProfile(user.id, parsed);
  }
}

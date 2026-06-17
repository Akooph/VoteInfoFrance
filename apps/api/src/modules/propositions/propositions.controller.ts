import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PropositionsService } from './propositions.service';
import { VotesService } from '../votes/votes.service';
import type { GeoLevel, Institution } from '@vif/types';

@ApiTags('propositions')
@Controller('propositions')
export class PropositionsController {
  constructor(
    private readonly propositions: PropositionsService,
    private readonly votes: VotesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List propositions filtered by geographic level and other criteria' })
  @ApiQuery({ name: 'geoLevel', required: false, enum: ['commune', 'departement', 'region', 'national', 'europeen'] })
  @ApiQuery({ name: 'geoCode', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'institution', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @Request() req: { user?: { id: string } },
    @Query('geoLevel') geoLevel?: GeoLevel,
    @Query('geoCode') geoCode?: string,
    @Query('status') status?: string,
    @Query('institution') institution?: Institution,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const clampedLimit = Math.min(limit, 50);
    return this.propositions.list({
      page,
      limit: clampedLimit,
      ...(req.user?.id !== undefined && { userId: req.user.id }),
      ...(geoLevel !== undefined && { geoLevel }),
      ...(geoCode !== undefined && { geoCode }),
      ...(status !== undefined && { status }),
      ...(institution !== undefined && { institution }),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a full proposition with its AI summary' })
  findOne(@Param('id') id: string, @Request() req: { user?: { id: string } }) {
    return this.propositions.findById(id, req.user?.id);
  }

  @Get(':id/tally')
  @ApiOperation({ summary: 'Get vote tallies for a proposition' })
  getTally(@Param('id') id: string) {
    return this.votes.getTally(id);
  }

  @Get(':id/map')
  @ApiOperation({ summary: 'Get per-department vote breakdown for choropleth map rendering' })
  getMapData(@Param('id') id: string) {
    return this.votes.getDepartmentTally(id);
  }
}

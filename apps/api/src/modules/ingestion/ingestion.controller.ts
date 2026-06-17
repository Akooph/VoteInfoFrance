import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { AdminApiKeyGuard } from '../../common/guards/admin-api-key.guard';

@ApiTags('admin')
@UseGuards(AdminApiKeyGuard)
@Controller('admin')
export class IngestionController {
  constructor(private readonly ingestion: IngestionService) {}

  @Post('ingestion/trigger')
  @ApiOperation({ summary: 'Manually trigger an ingestion run for a data source' })
  @ApiQuery({ name: 'source', enum: ['assemblee_nationale', 'senat', 'parlement_europeen', 'conseils_regionaux'] })
  trigger(@Query('source') source: string) {
    return this.ingestion.triggerSource(source);
  }

  @Get('ingestion/runs')
  @ApiOperation({ summary: 'List recent ingestion runs' })
  listRuns() {
    return this.ingestion.listRuns();
  }
}

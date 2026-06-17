import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeoService } from './geo.service';

@ApiTags('geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('lookup')
  @ApiOperation({ summary: 'Resolve a ZIP code to its 5 civic geographic levels' })
  @ApiQuery({ name: 'codePostal', required: true, example: '75001' })
  async lookup(@Query('codePostal') codePostal: string) {
    if (!codePostal || !/^\d{5}$/.test(codePostal)) {
      throw new BadRequestException('codePostal must be a 5-digit French ZIP code');
    }
    return this.geo.lookupByCodePostal(codePostal);
  }

  @Get('departements')
  @ApiOperation({ summary: 'List all 101 French departments' })
  listDepartements() {
    return this.geo.listDepartements();
  }

  @Get('regions')
  @ApiOperation({ summary: 'List all 18 French regions' })
  listRegions() {
    return this.geo.listRegions();
  }
}

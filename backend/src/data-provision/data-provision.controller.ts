import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../auth/role/roles.guard';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import { Role, Roles } from '../auth/role/roles.decorator';
import { AuthenticatedController } from '../shared/authenticated.controller';

@ApiTags('data-provision')
@ApiBearerAuth()
@Controller('api/data-provision')
@UseGuards(RolesGuard)
export class DataProvisionController extends AuthenticatedController {
  constructor(private readonly overpassDataService: OverpassDataService) {
    super();
  }

  @ApiOperation({ description: 'Trigger import of overpass data' })
  @Post('overpass')
  @Roles(Role.Admin)
  async importOverpassData(): Promise<string> {
    void this.overpassDataService.loadOverpassData();
    return 'Overpass data import triggered';
  }
}

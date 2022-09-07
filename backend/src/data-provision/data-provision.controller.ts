import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../auth/roles.guard';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import { Role, Roles } from '../auth/roles.decorator';

@ApiTags('overpass')
@ApiBearerAuth()
@Controller('api/data-provision')
@UseGuards(AuthGuard('auth0-spa'), RolesGuard)
export class DataProvisionController {
  constructor(private readonly overpassDataService: OverpassDataService) {}

  @ApiOperation({ description: 'Trigger import of overpass data' })
  @Post('overpass')
  @Roles(Role.Admin)
  async importOverpassData() {
    // noinspection ES6MissingAwait
    this.overpassDataService.loadOverpassData();

    return 'Overpass data import triggered';
  }
}

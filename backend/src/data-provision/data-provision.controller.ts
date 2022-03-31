import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import { Role, Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('overpass')
@ApiBearerAuth()
@Controller('api/data-provision')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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

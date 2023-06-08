import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationIndexService } from './location-index.service';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { InjectIntegrationUserInterceptor } from '../../user/interceptor/inject-integration-user.interceptor';
import { InjectUser } from '../../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { LocationIndexDocument } from '../schemas/location-index.schema';

// TODO sometimes too much data is sent back to the frontend
@ApiTags('location-index', 'integration')
@Controller('api/location-index-int')
export class LocationIndexIntController {
  constructor(private readonly locationIndexService: LocationIndexService) {}

  @ApiOperation({ description: 'Query for location index data' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('query')
  async query(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() query: ApiGeometryDto,
  ): Promise<LocationIndexDocument[]> {
    return this.locationIndexService.findIntersecting(integrationUser, query);
  }
}

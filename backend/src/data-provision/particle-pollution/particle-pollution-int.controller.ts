import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ParticlePollutionService } from './particle-pollution.service';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { InjectUser } from '../../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { InjectIntegrationUserInterceptor } from '../../user/interceptor/inject-integration-user.interceptor';
import { ParticlePollutionDocument } from '../schemas/particle-pollution.schema';

@ApiTags('particle-pollution', 'integration')
@Controller('api/particle-pollution-int')
export class ParticlePollutionIntController {
  constructor(
    private readonly particlePollutionService: ParticlePollutionService,
  ) {}

  @ApiOperation({ description: 'Query for particle pollution data' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('query')
  async query(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() query: ApiGeometryDto,
  ): Promise<ParticlePollutionDocument[]> {
    return this.particlePollutionService.findIntersecting(
      integrationUser,
      query,
    );
  }
}

import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ZensusAtlasService } from './zensus-atlas.service';
import ApiGeometryDto from '../dto/api-geometry.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { TApiDataProvision } from '@area-butler-types/types';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

@ApiTags('zensus-atlas', 'integration')
@Controller('api/zensus-atlas-int')
export class ZensusAtlasIntController {
  constructor(private readonly zensusAtlasService: ZensusAtlasService) {}

  @ApiOperation({ description: 'Query the zensus atlas' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('query')
  async query(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() query: ApiGeometryDto,
  ): Promise<TApiDataProvision> {
    return this.zensusAtlasService.findIntersecting(integrationUser, query);
  }
}

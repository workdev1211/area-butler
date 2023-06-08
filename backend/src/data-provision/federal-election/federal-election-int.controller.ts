import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { FederalElectionService } from './federal-election.service';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { InjectUser } from '../../user/inject-user.decorator';
import { InjectIntegrationUserInterceptor } from '../../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { FederalElectionDocument } from '../schemas/federal-election.schema';

@ApiTags('federal-election', 'integration')
@Controller('api/federal-election-int')
export class FederalElectionIntController {
  constructor(
    private readonly federalElectionService: FederalElectionService,
  ) {}

  @ApiOperation({ description: 'Query for federal election data' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('query')
  async query(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() query: ApiGeometryDto,
  ): Promise<FederalElectionDocument[]> {
    return this.federalElectionService.findIntersecting(integrationUser, query);
  }
}

import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RealEstateListingService } from './real-estate-listing.service';
import { InjectUser } from '../user/inject-user.decorator';
import ApiOpenAiRealEstateDescriptionQueryDto from './dto/api-open-ai-real-estate-description-query.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

@ApiTags('real-estate-listings', 'integration')
@Controller('api/real-estate-listings-int')
export class RealEstateListingIntController {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  @ApiOperation({ description: 'Fetch Open AI real estate description' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('open-ai-real-estate-desc')
  async fetchOpenAiRealEstateDescription(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() realEstateDescriptionQuery: ApiOpenAiRealEstateDescriptionQueryDto,
  ): Promise<string> {
    return this.realEstateListingService.fetchOpenAiRealEstateDesc(
      integrationUser,
      realEstateDescriptionQuery,
    );
  }
}

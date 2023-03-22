import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RealEstateListingService } from './real-estate-listing.service';
import { InjectUser } from '../user/inject-user.decorator';
import ApiOpenAiRealEstateDescriptionQueryDto from './dto/api-open-ai-real-estate-description-query.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationUserService } from '../user/integration-user.service';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { RealEstateListingIntService } from './real-estate-listing-int.service';
import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from '@area-butler-types/real-estate';
import { mapRealEstateListingToApiRealEstateListing } from './mapper/real-estate-listing.mapper';

@ApiTags('real-estate-listing', 'integration')
@Controller('api/real-estate-listing-int')
export class RealEstateListingIntController {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  @ApiOperation({ description: 'Fetch Open AI real estate description' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('open-ai-real-estate-desc')
  async fetchOpenAiRealEstateDescription(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() realEstateDescriptionQuery: ApiOpenAiRealEstateDescriptionQueryDto,
  ): Promise<string> {
    // TODO move to the interceptor
    this.integrationUserService.checkProdContAvailability(
      integrationUser,
      OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    );

    const realEstateDesc =
      await this.realEstateListingService.fetchOpenAiRealEstateDesc(
        integrationUser,
        realEstateDescriptionQuery,
      );

    // TODO move to the interceptor
    await this.integrationUserService.incrementProductUsage(
      integrationUser,
      OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    );

    return realEstateDesc;
  }

  @ApiOperation({
    description: 'Fetch a real estate listing by integration params',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get()
  async fetchByIntegrationParams(
    @InjectUser()
    { integrationType, integrationUserId }: TIntegrationUserDocument,
    @Query('integration-id') integrationId: string,
  ): Promise<ApiRealEstateListing> {
    const a = mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationType,
        integrationUserId,
      }),
    );

    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationType,
        integrationUserId,
      }),
    );
  }

  @ApiOperation({
    description: 'Fetch real estate listings of the current user',
  })
  @Get('listings')
  async fetchRealEstateListings(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Query('status') status: ApiRealEstateStatusEnum,
  ): Promise<ApiRealEstateListing[]> {
    // TODO doesn't work
    return (
      await this.realEstateListingService.fetchRealEstateListings(
        integrationUser,
        status,
      )
    ).map((l) => mapRealEstateListingToApiRealEstateListing(l));
  }
}

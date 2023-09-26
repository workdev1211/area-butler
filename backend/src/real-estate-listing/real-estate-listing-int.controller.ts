import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RealEstateListingService } from './real-estate-listing.service';
import { InjectUser } from '../user/inject-user.decorator';
import ApiOpenAiRealEstDescQueryDto from './dto/api-open-ai-real-est-desc-query.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { ProcessOpenAiIntUsageInterceptor } from './interceptor/process-open-ai-int-usage.interceptor';
import { InjectRealEstateListing } from './inject-real-estate-listing.decorator';
import { RealEstateListingDocument } from './schema/real-estate-listing.schema';
import { IntegrationUserService } from '../user/integration-user.service';
import { RealEstateListingIntService } from './real-estate-listing-int.service';
import ApiUnlockIntProductReqDto from './dto/api-unlock-int-product-req.dto';
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

  @ApiOperation({ description: 'Get real estate listings for current user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('listings')
  async fetchRealEstateListings(
    @Query('status') status: ApiRealEstateStatusEnum,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(
        integrationUser,
        status,
      )
    ).map((listing) => mapRealEstateListingToApiRealEstateListing(listing));
  }

  @ApiOperation({
    description: 'Get real estate listing by integration id for current user',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('listing/:id')
  async fetchRealEstateListing(
    @Param('id') integrationId: string,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationUserId: integrationUser.integrationUserId,
        integrationType: integrationUser.integrationType,
      }),
    );
  }

  @ApiOperation({ description: 'Fetch Open AI real estate description' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('open-ai-real-estate-desc')
  async fetchOpenAiRealEstateDescription(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @InjectRealEstateListing() realEstateListing: RealEstateListingDocument,
    @Body() realEstateDescriptionQuery: ApiOpenAiRealEstDescQueryDto,
  ): Promise<string> {
    return this.realEstateListingService.fetchOpenAiRealEstateDesc(
      integrationUser,
      realEstateDescriptionQuery,
      realEstateListing,
    );
  }

  @ApiOperation({
    description: 'Unlock specified product for the real estate',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('unlock-product')
  async unlockProduct(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() { integrationId, actionType }: ApiUnlockIntProductReqDto,
  ): Promise<void> {
    const availProdContType =
      await this.integrationUserService.getAvailProdContTypeOrFail(
        integrationUser,
        actionType,
      );

    await this.realEstateListingIntService.unlockProduct(
      integrationUser,
      availProdContType,
      integrationId,
    );

    await this.integrationUserService.incrementProductUsage(
      integrationUser,
      availProdContType,
    );
  }
}

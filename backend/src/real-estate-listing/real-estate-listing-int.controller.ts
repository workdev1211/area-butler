import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
  IApiRealEstStatusByUser,
} from '@area-butler-types/real-estate';
import { mapRealEstateListingToApiRealEstateListing } from './mapper/real-estate-listing.mapper';
import ApiUpsertRealEstateListingDto from '../dto/api-upsert-real-estate-listing.dto';

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
    @Query('status') status: string,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(
        integrationUser,
        status,
      )
    ).map((realEstate) =>
      mapRealEstateListingToApiRealEstateListing(integrationUser, realEstate),
    );
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
      integrationUser,
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

  @ApiOperation({ description: 'Get real estate statuses of the current user' })
  @Get('status')
  async fetchStatusesByUser(
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<IApiRealEstStatusByUser> {
    return this.realEstateListingService.fetchStatusesByUser(integrationUser);
  }

  @ApiOperation({ description: 'Update a real estate listing' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put(':id')
  async updateRealEstateListing(
    @Param('id') realEstateId: string,
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() updatedData: Partial<ApiUpsertRealEstateListingDto>,
  ): Promise<ApiRealEstateListing> {
    return mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingService.updateRealEstateListing(
        integrationUser,
        realEstateId,
        updatedData,
      ),
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

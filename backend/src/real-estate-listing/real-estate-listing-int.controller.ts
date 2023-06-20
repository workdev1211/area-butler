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
import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from '@area-butler-types/real-estate';
import { mapRealEstateListingToApiRealEstateListing } from './mapper/real-estate-listing.mapper';
import { ProcessOpenAiIntUsageInterceptor } from './interceptor/process-open-ai-int-usage.interceptor';
import { InjectRealEstateListing } from './inject-real-estate-listing.decorator';
import { RealEstateListingDocument } from './schema/real-estate-listing.schema';
import { IntegrationUserService } from '../user/integration-user.service';
import { RealEstateListingIntService } from './real-estate-listing-int.service';
import ApiUnlockIntProductReqDto from './dto/api-unlock-int-product-req.dto';

@ApiTags('real-estate-listing', 'integration')
@Controller('api/real-estate-listing-int')
export class RealEstateListingIntController {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  @ApiOperation({
    description: 'Fetch real estate listings of the current user',
  })
  @Get('listings')
  async fetchRealEstateListings(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Query('status') status: ApiRealEstateStatusEnum,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(
        integrationUser,
        status,
      )
    ).map((l) => mapRealEstateListingToApiRealEstateListing(l));
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
    @Body() realEstateDescriptionQuery: ApiOpenAiRealEstateDescriptionQueryDto,
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
    @Body() { realEstateListingId, actionType }: ApiUnlockIntProductReqDto,
  ): Promise<void> {
    this.integrationUserService.checkProdContAvailability(
      integrationUser,
      actionType,
    );

    await this.realEstateListingIntService.unlockProduct(
      integrationUser,
      realEstateListingId,
      actionType,
    );

    await this.integrationUserService.incrementProductUsage(
      integrationUser,
      actionType,
    );
  }
}

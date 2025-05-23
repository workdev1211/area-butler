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
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
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
  ) {}

  @ApiOperation({ description: 'Get real estate listings for current user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('listings')
  async fetchRealEstateListings(
    @Query('status') status: string,
    @Query('status2') status2: string,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<ApiRealEstateListing[]> {
    return (
      await this.realEstateListingService.fetchRealEstateListings(
        integrationUser,
        { status, status2 },
      )
    ).map((realEstate) =>
      mapRealEstateListingToApiRealEstateListing(integrationUser, realEstate),
    );
  }

  @ApiOperation({ description: 'Get real estate statuses of the current user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('status')
  fetchStatusesByUser(
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
  unlockProduct(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() unlockProductDto: ApiUnlockIntProductReqDto,
  ): Promise<void> {
    return this.realEstateListingIntService.handleProductUnlock(
      integrationUser,
      unlockProductDto,
    );
  }
}

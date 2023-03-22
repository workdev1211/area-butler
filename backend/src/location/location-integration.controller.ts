import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as dayjs from 'dayjs';

import { LocationService } from './location.service';
import { mapSnapshotToEmbeddableMap } from './mapper/embeddable-maps.mapper';
import ApiSearchDto from '../dto/api-search.dto';
import ApiSearchResponseDto from '../dto/api-search-response.dto';
import ApiSearchResultSnapshotDto from '../dto/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotResponseDto from '../dto/api-search-result-snapshot-response.dto';
import ApiUpdateSearchResultSnapshotDto from '../dto/api-update-search-result-snapshot.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import ApiOpenAiLocationDescriptionQueryDto from './dto/api-open-ai-location-description-query.dto';
import ApiOpenAiLocationRealEstateDescriptionQueryDto from './dto/api-open-ai-location-real-estate-description-query.dto';
import { IntegrationUserService } from '../user/integration-user.service';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';

@ApiTags('location', 'integration')
@Controller('api/location-integration')
export class LocationIntegrationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  @ApiOperation({ description: 'Fetch a specific embeddable map' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshot/:id')
  async fetchSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') id: string,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const map = await this.locationService.fetchSnapshotById(
      integrationUser,
      id,
    );

    map.updatedAt = dayjs().toDate();
    await map.save();

    // TODO doesn't work
    const realEstateListings =
      await this.realEstateListingService.fetchRealEstateListings(
        integrationUser,
      );

    return mapSnapshotToEmbeddableMap(map, false, realEstateListings);
  }

  @ApiOperation({
    description:
      'Search for a location, creates an entry in the "locationsearches" collection',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('search')
  async searchLocation(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() searchData: ApiSearchDto,
  ): Promise<ApiSearchResponseDto> {
    return this.locationService.searchLocation(integrationUser, searchData);
  }

  @ApiOperation({ description: 'Create a new embeddable map' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('snapshot')
  async createSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.locationService.createSnapshot(integrationUser, snapshot);
  }

  @ApiOperation({ description: 'Update an existing embeddable map' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('snapshot/:id')
  async updateSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') id: string,
    @Body() body: ApiUpdateSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return mapSnapshotToEmbeddableMap(
      await this.locationService.updateSnapshot(integrationUser, id, body),
    );
  }

  @ApiOperation({ description: 'Fetch Open AI location description' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('open-ai-loc-desc')
  async fetchOpenAiLocationDescription(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() locationDescriptionQuery: ApiOpenAiLocationDescriptionQueryDto,
  ): Promise<string> {
    this.integrationUserService.checkProdContAvailability(
      integrationUser,
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
    );

    const locationDescription =
      await this.locationService.fetchOpenAiLocationDescription(
        integrationUser,
        locationDescriptionQuery,
      );

    await this.integrationUserService.incrementProductUsage(
      integrationUser,
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
    );

    return locationDescription;
  }

  @ApiOperation({
    description: 'Fetch Open AI location and real estate description',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('open-ai-loc-real-est-desc')
  async fetchOpenAiLocRealEstDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    locationRealEstateDescriptionQuery: ApiOpenAiLocationRealEstateDescriptionQueryDto,
  ): Promise<string> {
    this.integrationUserService.checkProdContAvailability(
      integrationUser,
      OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    );

    const locRealEstDesc = await this.locationService.fetchOpenAiLocRealEstDesc(
      integrationUser,
      locationRealEstateDescriptionQuery,
    );

    await this.integrationUserService.incrementProductUsage(
      integrationUser,
      OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    );

    return locRealEstDesc;
  }
}

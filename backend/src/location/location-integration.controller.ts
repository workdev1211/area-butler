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
import { LocationIntegrationService } from './location-integration.service';
// import { OnOfficeIntActTypesEnum } from '@area-butler-types/on-office';
import { ProcessOpenAiIntUsageInterceptor } from '../real-estate-listing/interceptor/process-open-ai-int-usage.interceptor';
import { InjectRealEstateListing } from '../real-estate-listing/inject-real-estate-listing.decorator';
import { RealEstateListingDocument } from '../real-estate-listing/schema/real-estate-listing.schema';
import { MongoParamPipe } from '../pipe/mongo-param.pipe';
import { MongoSortParamPipe } from '../pipe/mongo-sort-param.pipe';
import { IApiMongoParams } from '@area-butler-types/types';

// TODO sometimes too much data is sent back to the frontend
@ApiTags('location', 'integration')
@Controller('api/location-integration')
export class LocationIntegrationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly locationIntegrationService: LocationIntegrationService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  @ApiOperation({ description: 'Create a new map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('snapshot')
  async createSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.locationIntegrationService.createSnapshot(
      integrationUser,
      snapshot,
    );
  }

  @ApiOperation({
    description: 'Fetch the embeddable maps for the current user',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshots')
  async fetchSnapshots(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Query('skip', MongoParamPipe) skip: number,
    @Query('limit', MongoParamPipe) limit: number,
    @Query('sort', MongoSortParamPipe)
    sort: IApiMongoParams = { 'snapshot.placesLocation.label': 1 },
  ): Promise<ApiSearchResultSnapshotResponseDto[]> {
    const includedFields = {
      token: 1,
      description: 1,
      config: 1,
      createdAt: 1,
      endsAt: 1,
      lastAccess: 1,
      visitAmount: 1,
      'snapshot.location': 1,
      'snapshot.description': 1,
      'snapshot.placesLocation.label': 1,
    };

    return (
      await this.locationService.fetchSnapshots(
        integrationUser,
        skip,
        limit,
        includedFields,
        sort,
      )
    ).map((r) => mapSnapshotToEmbeddableMap(r));
  }

  @ApiOperation({ description: 'Fetch a specific map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshot/:id')
  async fetchSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') id: string,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const snapshotDoc = await this.locationService.fetchSnapshotById(
      integrationUser,
      id,
    );

    snapshotDoc.updatedAt = dayjs().toDate();
    await snapshotDoc.save();

    const realEstateListings =
      await this.realEstateListingService.fetchRealEstateListings(
        integrationUser,
      );

    return mapSnapshotToEmbeddableMap(snapshotDoc, false, realEstateListings);
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

  @ApiOperation({ description: 'Update an existing map snapshot' })
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
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('open-ai-loc-desc')
  async fetchOpenAiLocationDescription(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() locationDescriptionQuery: ApiOpenAiLocationDescriptionQueryDto,
  ): Promise<string> {
    return this.locationService.fetchOpenAiLocationDescription(
      integrationUser,
      locationDescriptionQuery,
    );
  }

  @ApiOperation({
    description: 'Fetch Open AI location and real estate description',
  })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('open-ai-loc-real-est-desc')
  async fetchOpenAiLocRealEstDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @InjectRealEstateListing() realEstateListing: RealEstateListingDocument,
    @Body()
    locationRealEstateDescriptionQuery: ApiOpenAiLocationRealEstateDescriptionQueryDto,
  ): Promise<string> {
    return this.locationService.fetchOpenAiLocRealEstDesc(
      integrationUser,
      locationRealEstateDescriptionQuery,
      realEstateListing,
    );
  }

  // TODO remove in future
  // @ApiOperation({
  //   description:
  //     'Unlock iFrame (interactive map) for 1 year for a specific snapshot',
  // })
  // @UseInterceptors(InjectIntegrationUserInterceptor)
  // @Post('unlock-iframe/:id')
  // async unlockIframe(
  //   @InjectUser() integrationUser: TIntegrationUserDocument,
  //   @Param('id') id: string,
  // ): Promise<Date> {
  //   // TODO move to the interceptor
  //   this.integrationUserService.checkProdContAvailability(
  //     integrationUser,
  //     OnOfficeIntActTypesEnum.UNLOCK_IFRAME,
  //   );
  //
  //   const { iframeEndsAt } =
  //     await this.locationIntegrationService.setIframeDuration(
  //       integrationUser,
  //       id,
  //     );
  //
  //   await this.integrationUserService.incrementProductUsage(
  //     integrationUser,
  //     OnOfficeIntActTypesEnum.UNLOCK_IFRAME,
  //   );
  //
  //   return iframeEndsAt;
  // }
}

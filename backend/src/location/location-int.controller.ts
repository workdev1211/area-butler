import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationService } from './location.service';
import { mapSnapshotToEmbeddableMap } from './mapper/embeddable-maps.mapper';
import ApiSearchDto from '../dto/api-search.dto';
import ApiSearchResultSnapshotDto from '../dto/api-search-result-snapshot.dto';
import ApiUpdateSearchResultSnapshotDto from '../dto/api-update-search-result-snapshot.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import ApiOpenAiLocDescQueryDto from './dto/api-open-ai-loc-desc-query.dto';
import ApiOpenAiLocRealEstDescQueryDto from './dto/api-open-ai-loc-real-est-desc-query.dto';
import { ProcessOpenAiIntUsageInterceptor } from '../real-estate-listing/interceptor/process-open-ai-int-usage.interceptor';
import { InjectRealEstateListing } from '../real-estate-listing/inject-real-estate-listing.decorator';
import { RealEstateListingDocument } from '../real-estate-listing/schema/real-estate-listing.schema';
import ApiFetchSnapshotsReqDto from './dto/api-fetch-snapshots-req.dto';
import { LocationIntService } from './location-int.service';
import {
  ApiSearchResponse,
  ApiSearchResultSnapshotResponse,
} from '@area-butler-types/types';
import { IApiLateSnapConfigOption } from '@area-butler-types/location';

// TODO sometimes too much data is sent back to the frontend
@ApiTags('location', 'integration')
@Controller('api/location-int')
export class LocationIntController {
  constructor(
    private readonly locationService: LocationService,
    private readonly locationIntService: LocationIntService,
  ) {}

  @ApiOperation({
    description:
      'Search for a location, creates an entry in the "locationsearches" collection',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('search')
  async searchLocation(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() searchData: ApiSearchDto,
  ): Promise<ApiSearchResponse> {
    return this.locationService.searchLocation(integrationUser, searchData);
  }

  @ApiOperation({ description: 'Create a new map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('snapshot')
  async createSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.locationIntService.createSnapshot(integrationUser, snapshot);
  }

  @ApiOperation({
    description: 'Fetch the embeddable maps for the current user',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshots')
  async fetchSnapshots(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Query() fetchSnapshotsReq: ApiFetchSnapshotsReqDto,
  ): Promise<ApiSearchResultSnapshotResponse[]> {
    const {
      skip: skipNumber,
      limit: limitNumber,
      filter: filterParams,
      project: projectParams,
      sort: sortParams,
    } = fetchSnapshotsReq;

    const resultProjectParams = projectParams || {
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
      'integrationParams.integrationId': 1,
    };

    return (
      await this.locationService.fetchSnapshots({
        skipNumber,
        limitNumber,
        sortParams,
        filterParams,
        projectParams: resultProjectParams,
        user: integrationUser,
      })
    ).map((snapshotDoc) =>
      mapSnapshotToEmbeddableMap(integrationUser, snapshotDoc),
    );
  }

  @ApiOperation({ description: 'Fetch a specific map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshot/:id')
  async fetchSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') id: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshotDoc = await this.locationService.fetchSnapshotByIdOrFail(
      integrationUser,
      id,
    );

    return mapSnapshotToEmbeddableMap(integrationUser, snapshotDoc, false);
  }

  @ApiOperation({
    description: 'Fetch the configs of the latest snapshots',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshots/configs')
  async fetchLateSnapConfigs(
    @Query('limitNumber', ParseIntPipe) limitNumber = 5,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<IApiLateSnapConfigOption[]> {
    return this.locationService.fetchLateSnapConfigs(
      integrationUser,
      limitNumber,
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
    @Body() locationDescriptionQuery: ApiOpenAiLocDescQueryDto,
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
    locationRealEstateDescriptionQuery: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    return this.locationService.fetchOpenAiLocRealEstDesc(
      integrationUser,
      locationRealEstateDescriptionQuery,
      realEstateListing,
    );
  }

  @ApiOperation({ description: 'Update an existing map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('snapshot/:id')
  async updateSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') snapshotId: string,
    @Body() body: ApiUpdateSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return mapSnapshotToEmbeddableMap(
      integrationUser,
      await this.locationService.updateSnapshot(
        integrationUser,
        snapshotId,
        body,
      ),
    );
  }

  @ApiOperation({
    description: 'Update an existing map snapshot description',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('snapshot/:id/description')
  async updateSnapshotDescription(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') snapshotId: string,
    @Body() { description }: { description: string },
  ): Promise<ApiSearchResultSnapshotResponse> {
    return mapSnapshotToEmbeddableMap(
      integrationUser,
      await this.locationService.updateSnapshotDescription(
        integrationUser,
        snapshotId,
        description,
      ),
    );
  }

  @ApiOperation({ description: 'Delete an existing map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Delete('snapshot/:id')
  async deleteSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') snapshotId: string,
  ): Promise<void> {
    return this.locationIntService.deleteSnapshot(integrationUser, snapshotId);
  }
}

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
import ApiLocationSearchDto from '../dto/api-location-search.dto';
import ApiUpdateSearchResultSnapshotDto from './dto/snapshot/api-update-search-result-snapshot.dto';
import { InjectUser } from '../user/inject-user.decorator';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import ApiFetchReqParamsDto from '../dto/api-fetch-req-params.dto';
import {
  ApiSearchResponse,
  ApiSearchResultSnapshotResponse,
} from '@area-butler-types/types';
import { IApiLateSnapConfigOption } from '@area-butler-types/location';
import { SnapshotService } from './snapshot.service';
import ApiCreateSnapshotReqDto from './dto/snapshot/api-create-snapshot-req.dto';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { SearchResultSnapshotDocument } from './schema/search-result-snapshot.schema';

// TODO sometimes too much data is sent back to the frontend
@ApiTags('location', 'integration')
@Controller('api/location-int')
export class LocationIntController {
  constructor(
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly locationService: LocationService,
    private readonly snapshotService: SnapshotService,
  ) {}

  @ApiOperation({
    description:
      'Search for a location, creates an entry in the "locationsearches" collection',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('location-search')
  searchLocation(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() searchData: ApiLocationSearchDto,
  ): Promise<ApiSearchResponse> {
    return this.locationService.searchLocation(integrationUser, searchData);
  }

  @ApiOperation({ description: 'Duplicate an existing map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('snapshot/:id')
  duplicateSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') snapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.duplicateSnapshot(integrationUser, snapshotId);
  }

  @ApiOperation({ description: 'Create a new map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('snapshot')
  createSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() createSnapshotReqDto: ApiCreateSnapshotReqDto,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.createSnapshot(integrationUser, {
      snapshotReq: createSnapshotReqDto,
    });
  }

  @ApiOperation({ description: 'Fetch a specific map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshot/:id')
  fetchSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') snapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.fetchSnapshotService.fetchSnapshotByIdOrFail(
      integrationUser,
      snapshotId,
    );
  }

  @ApiOperation({
    description: 'Fetch the configs of the latest snapshots',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Get('snapshots/configs')
  fetchLastSnapConfigs(
    @Query('limitNumber', ParseIntPipe) limitNumber = 5,
    @InjectUser() integrationUser: TIntegrationUserDocument,
  ): Promise<IApiLateSnapConfigOption[]> {
    return this.locationService.fetchLastSnapConfigs(
      integrationUser,
      limitNumber,
    );
  }

  @ApiOperation({
    description: 'Fetch the embeddable maps for the current user',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('fetch-snapshots')
  fetchSnapshots(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    fetchSnapshotsReq: ApiFetchReqParamsDto<SearchResultSnapshotDocument>,
  ): Promise<ApiSearchResultSnapshotResponse[]> {
    const {
      filter: filterQuery,
      limit: limitNumber,
      project: projectQuery,
      skip: skipNumber,
      sort: sortQuery,
    } = fetchSnapshotsReq;

    const resProjectQuery = projectQuery || {
      addressToken: 1,
      config: 1,
      createdAt: 1,
      description: 1,
      endsAt: 1,
      lastAccess: 1,
      realEstateId: 1,
      token: 1,
      unaddressToken: 1,
      visitAmount: 1,
      'snapshot.description': 1,
      'snapshot.location': 1,
      'snapshot.placesLocation.label': 1,
    };

    return this.fetchSnapshotService.fetchSnapshots(integrationUser, {
      filterQuery,
      limitNumber,
      skipNumber,
      sortQuery,
      projectQuery: resProjectQuery,
    });
  }

  @ApiOperation({
    description: 'Fetch company snapshots',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('fetch-company-snapshots')
  fetchCompanySnapshots(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    fetchSnapshotsReq: ApiFetchReqParamsDto<SearchResultSnapshotDocument>,
  ): Promise<ApiSearchResultSnapshotResponse[]> {
    const {
      filter: filterQuery,
      limit: limitNumber,
      skip: skipNumber,
    } = fetchSnapshotsReq;

    return this.fetchSnapshotService.fetchCompanySnapshots(integrationUser, {
      filterQuery,
      limitNumber,
      skipNumber,
    });
  }

  @ApiOperation({ description: 'Update an existing map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Put('snapshot/:id')
  updateSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') snapshotId: string,
    @Body() updateSnapshotDto: ApiUpdateSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.updateSnapshot(
      integrationUser,
      snapshotId,
      updateSnapshotDto,
    );
  }

  @ApiOperation({ description: 'Delete an existing map snapshot' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Delete('snapshot/:id')
  deleteSnapshot(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Param('id') snapshotId: string,
  ): Promise<void> {
    return this.snapshotService.deleteSnapshot(integrationUser, snapshotId);
  }
}

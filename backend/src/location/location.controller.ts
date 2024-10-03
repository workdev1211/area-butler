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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationService } from './location.service';
import ApiLocationSearchDto from '../dto/api-location-search.dto';
import ApiSearchResponseDto from '../dto/api-search-response.dto';
import ApiUpdateSearchResultSnapshotDto from './dto/snapshot/api-update-search-result-snapshot.dto';
import ApiLastLocSearchesDto from '../dto/api-last-loc-searches.dto';
import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { AuthenticatedController } from '../shared/authenticated.controller';
import ApiFetchReqParamsDto from '../dto/api-fetch-req-params.dto';
import { IApiLateSnapConfigOption } from '@area-butler-types/location';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { SnapshotService } from './snapshot.service';
import ApiCreateSnapshotReqDto from './dto/snapshot/api-create-snapshot-req.dto';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { SearchResultSnapshotDocument } from './schema/search-result-snapshot.schema';

@ApiTags('location')
@Controller('api/location')
export class LocationController extends AuthenticatedController {
  constructor(
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly locationService: LocationService,
    private readonly snapshotService: SnapshotService,
  ) {
    super();
  }

  @ApiOperation({
    description:
      'Search for a location, creates an entry in the "locationsearches" collection',
  })
  @Post('location-search')
  searchLocation(
    @InjectUser() user: UserDocument,
    @Body() searchData: ApiLocationSearchDto,
  ): Promise<ApiSearchResponseDto> {
    return this.locationService.searchLocation(user, searchData);
  }

  @ApiOperation({ description: 'Duplicate an existing map snapshot' })
  @Post('snapshot/:id')
  duplicateSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') snapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.duplicateSnapshot(user, snapshotId);
  }

  @ApiOperation({ description: 'Create a new map snapshot' })
  @Post('snapshot')
  createSnapshot(
    @InjectUser() user: UserDocument,
    @Body() createSnapshotReqDto: ApiCreateSnapshotReqDto,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.createSnapshot(user, {
      snapshotReq: createSnapshotReqDto,
    });
  }

  @ApiOperation({ description: 'Fetch a specific map snapshot' })
  @Get('snapshot/:id')
  fetchSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') snapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.fetchSnapshotService.fetchSnapshotByIdOrFail(user, snapshotId);
  }

  @ApiOperation({
    description: 'Fetch the configs of the latest snapshots',
  })
  @Get('snapshots/configs')
  fetchLastSnapConfigs(
    @Query('limitNumber', ParseIntPipe) limitNumber = 5,
    @InjectUser() user: UserDocument,
  ): Promise<IApiLateSnapConfigOption[]> {
    return this.locationService.fetchLastSnapConfigs(user, limitNumber);
  }

  @ApiOperation({ description: 'Fetch latest location searches' })
  @Get('last-loc-searches')
  fetchLastSearches(
    @InjectUser() user: UserDocument,
  ): Promise<ApiLastLocSearchesDto> {
    return this.locationService.fetchLastLocSearches(user);
  }

  @ApiOperation({
    description: 'Fetch the embeddable maps for the current user',
  })
  @Post('snapshots')
  fetchSnapshots(
    @InjectUser() user: UserDocument,
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
      token: 1,
      unaddressToken: 1,
      visitAmount: 1,
      'snapshot.description': 1,
      'snapshot.location': 1,
      'snapshot.placesLocation.label': 1,
    };

    return this.fetchSnapshotService.fetchSnapshots(user, {
      filterQuery,
      limitNumber,
      skipNumber,
      sortQuery,
      projectQuery: resProjectQuery,
    });
  }

  @ApiOperation({ description: 'Update an existing map snapshot' })
  @Put('snapshot/:id')
  updateSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') snapshotId: string,
    @Body() body: ApiUpdateSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.updateSnapshot(user, snapshotId, body);
  }

  @ApiOperation({ description: 'Delete an existing map snapshot' })
  @Delete('snapshot/:id')
  deleteSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') snapshotId: string,
  ): Promise<void> {
    return this.snapshotService.deleteSnapshot(user, snapshotId);
  }
}

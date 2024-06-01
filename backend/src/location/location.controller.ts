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
import ApiSearchDto from '../dto/api-search.dto';
import ApiSearchResponseDto from '../dto/api-search-response.dto';
import ApiUpdateSearchResultSnapshotDto from './dto/snapshot/api-update-search-result-snapshot.dto';
import ApiUserRequestsDto from '../dto/api-user-requests.dto';
import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import ApiOpenAiLocDescQueryDto from './dto/api-open-ai-loc-desc-query.dto';
import ApiOpenAiLocRealEstDescQueryDto from './dto/api-open-ai-loc-real-est-desc-query.dto';
import ApiFetchSnapshotsReqDto from './dto/api-fetch-snapshots-req.dto';
import { IApiLateSnapConfigOption } from '@area-butler-types/location';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { SnapshotService } from './snapshot.service';
import ApiCreateSnapshotReqDto from './dto/snapshot/api-create-snapshot-req.dto';
import { FetchSnapshotService } from './fetch-snapshot.service';

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
  @Post('search')
  searchLocation(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() searchData: ApiSearchDto,
  ): Promise<ApiSearchResponseDto> {
    return this.locationService.searchLocation(user, searchData);
  }

  @ApiOperation({ description: 'Duplicate an existing map snapshot' })
  @Post('snapshot/:id')
  duplicateSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') snapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.duplicateSnapshot(user, snapshotId);
  }

  @ApiOperation({ description: 'Create a new map snapshot' })
  @Post('snapshot')
  createSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() createSnapshotReqDto: ApiCreateSnapshotReqDto,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotService.createSnapshot(user, { snapshotReq: createSnapshotReqDto });
  }

  @ApiOperation({ description: 'Update an existing map snapshot' })
  @Put('snapshot/:id')
  updateSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
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

  @ApiOperation({ description: 'Query latest user requests' })
  @Get('latest-user-requests')
  latestUserRequests(
    @InjectUser() user: UserDocument,
  ): Promise<ApiUserRequestsDto> {
    return this.locationService.latestUserRequests(user);
  }

  @ApiOperation({
    description: 'Fetch the embeddable maps for the current user',
  })
  @Get('snapshots')
  fetchSnapshots(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query() fetchSnapshotsReq: ApiFetchSnapshotsReqDto,
  ): Promise<ApiSearchResultSnapshotResponse[]> {
    const {
      skip: skipNumber,
      limit: limitNumber,
      filter: filterQuery,
      project: projectQuery,
      sort: sortQuery,
    } = fetchSnapshotsReq;

    const resProjectQuery = projectQuery || {
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

    return this.fetchSnapshotService.fetchSnapshots(user, {
      filterQuery,
      sortQuery,
      limitNumber,
      skipNumber,
      projectQuery: resProjectQuery,
    });
  }

  @ApiOperation({ description: 'Fetch a specific map snapshot' })
  @Get('snapshot/:id')
  fetchSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
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
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
  ): Promise<IApiLateSnapConfigOption[]> {
    return this.locationService.fetchLastSnapConfigs(user, limitNumber);
  }

  @ApiOperation({ description: 'Fetch Open AI location description' })
  @Post('open-ai-loc-desc')
  fetchOpenAiLocationDescription(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() locationDescriptionQuery: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    return this.locationService.fetchOpenAiLocationDescription(
      user,
      locationDescriptionQuery,
    );
  }

  @ApiOperation({
    description: 'Fetch Open AI location and real estate description',
  })
  @Post('open-ai-loc-real-est-desc')
  fetchOpenAiLocRealEstDesc(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    locRealEstDescQueryQuery: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    return this.locationService.fetchOpenAiLocRealEstDesc(
      user,
      locRealEstDescQueryQuery,
    );
  }
}

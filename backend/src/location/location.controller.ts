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
import { mapSnapshotToEmbeddableMap } from './mapper/embeddable-maps.mapper';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import ApiSearchDto from '../dto/api-search.dto';
import ApiSearchResponseDto from '../dto/api-search-response.dto';
import ApiSearchResultSnapshotDto from '../dto/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotResponseDto from '../dto/api-search-result-snapshot-response.dto';
import ApiUpdateSearchResultSnapshotDto from '../dto/api-update-search-result-snapshot.dto';
import ApiUserRequestsDto from '../dto/api-user-requests.dto';
import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { SubscriptionService } from '../user/subscription.service';
import ApiCreateRouteSnapshotDto from '../dto/api-create-route-snapshot.dto';
import { SnapshotExtService } from './snapshot-ext.service';
import ApiOpenAiLocDescQueryDto from './dto/api-open-ai-loc-desc-query.dto';
import ApiOpenAiLocRealEstDescQueryDto from './dto/api-open-ai-loc-real-est-desc-query.dto';
import ApiFetchSnapshotsReqDto from './dto/api-fetch-snapshots-req.dto';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { IApiLateSnapConfigOption } from '@area-butler-types/location';

@ApiTags('location')
@Controller('api/location')
export class LocationController extends AuthenticatedController {
  constructor(
    private readonly locationService: LocationService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {
    super();
  }

  @ApiOperation({
    description:
      'Search for a location, creates an entry in the "locationsearches" collection',
  })
  @Post('search')
  async searchLocation(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() searchData: ApiSearchDto,
  ): Promise<ApiSearchResponseDto> {
    return this.locationService.searchLocation(user, searchData);
  }

  @ApiOperation({ description: 'Create a new map snapshot' })
  @Post('snapshot')
  async createSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.locationService.createSnapshot(user, snapshot);
  }

  @ApiOperation({
    description: 'Create a new embeddable map with route fetching',
  })
  @Post('route-snapshot')
  async createRouteSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() snapshot: ApiCreateRouteSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.snapshotExtService.createRouteSnapshot(user, snapshot);
  }

  // TODO think about merging updateSnapshot and updateSnapshotDescription
  // TODO think about using class-transformer instead of a mapper
  @ApiOperation({ description: 'Update an existing map snapshot' })
  @Put('snapshot/:id')
  async updateSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
    @Body() body: ApiUpdateSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return mapSnapshotToEmbeddableMap(
      await this.locationService.updateSnapshot(user, id, body),
    );
  }

  @ApiOperation({
    description: 'Update an existing map snapshot description',
  })
  @Put('snapshot/:id/description')
  async updateSnapshotDescription(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
    @Body() { description }: { description: string },
  ): Promise<ApiSearchResultSnapshotResponse> {
    return mapSnapshotToEmbeddableMap(
      await this.locationService.updateSnapshotDescription(
        user,
        id,
        description,
      ),
    );
  }

  @ApiOperation({ description: 'Delete an existing map snapshot' })
  @Delete('snapshot/:id')
  async deleteSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') id: string,
  ): Promise<void> {
    await this.locationService.deleteSnapshot(user, id);
  }

  @ApiOperation({ description: 'Query latest user requests' })
  @Get('latest-user-requests')
  async latestUserRequests(
    @InjectUser() user: UserDocument,
  ): Promise<ApiUserRequestsDto> {
    return this.locationService.latestUserRequests(user);
  }

  @ApiOperation({
    description: 'Fetch the embeddable maps for the current user',
  })
  @Get('snapshots')
  async fetchSnapshots(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query() fetchSnapshotsReq: ApiFetchSnapshotsReqDto,
  ): Promise<ApiSearchResultSnapshotResponseDto[]> {
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
    };

    return (
      await this.locationService.fetchSnapshots({
        user,
        skipNumber,
        limitNumber,
        filterParams,
        sortParams,
        projectParams: resultProjectParams,
      })
    ).map((r) => mapSnapshotToEmbeddableMap(r));
  }

  @ApiOperation({ description: 'Fetch a specific map snapshot' })
  @Get('snapshot/:id')
  async fetchSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const snapshotDoc = await this.locationService.fetchSnapshotByIdOrFail(
      user,
      id,
    );

    snapshotDoc.updatedAt = new Date();
    await snapshotDoc.save();

    const realEstateListings =
      await this.realEstateListingService.fetchRealEstateListings(user);

    return mapSnapshotToEmbeddableMap(snapshotDoc, false, realEstateListings);
  }

  @ApiOperation({
    description: 'Fetch the configs of the latest snapshots',
  })
  @Get('snapshots/configs')
  async fetchLateSnapConfigs(
    @Query('limitNumber', ParseIntPipe) limitNumber = 5,
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
  ): Promise<IApiLateSnapConfigOption[]> {
    return this.locationService.fetchLateSnapConfigs(user, limitNumber);
  }

  @ApiOperation({ description: 'Fetch Open AI location description' })
  @Post('open-ai-loc-desc')
  async fetchOpenAiLocationDescription(
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
  async fetchOpenAiLocRealEstDesc(
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

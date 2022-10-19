import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { IApiMongoParams } from '@area-butler-types/types';
import { OpenAiService } from '../client/open-ai/open-ai.service';
import {
  openAiTextLength,
  openAiTonalities,
} from '../../../shared/constants/open-ai';
import ApiCreateRouteSnapshotQueryDto from '../dto/api-create-route-snapshot-query.dto';
import { ApiSnapshotService } from './api-snapshot.service';
import { MongoParamPipe } from '../pipe/mongo-param.pipe';
import { MongoSortParamPipe } from '../pipe/mongo-sort-param.pipe';
import ApiAiDescriptionQueryDto from './dto/api-ai-description-query.dto';

@ApiTags('location')
@Controller('api/location')
export class LocationController extends AuthenticatedController {
  constructor(
    private readonly locationService: LocationService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly openAiService: OpenAiService,
    private readonly apiSnapshotService: ApiSnapshotService,
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

  @ApiOperation({ description: 'Create a new embeddable map' })
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
    @Body() snapshotData: ApiCreateRouteSnapshotQueryDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.apiSnapshotService.createRouteSnapshot(user, snapshotData);
  }

  // TODO think about merging updateSnapshot and updateSnapshotDescription
  // TODO think about using class-transformer instead of a mapper
  @ApiOperation({ description: 'Update an existing embeddable map' })
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
    description: 'Update an existing embeddable map description',
  })
  @Put('snapshot/:id/description')
  async updateSnapshotDescription(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
    @Body() { description }: { description: string },
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return mapSnapshotToEmbeddableMap(
      await this.locationService.updateSnapshotDescription(
        user,
        id,
        description,
      ),
    );
  }

  @ApiOperation({ description: 'Delete an existing embeddable map' })
  @Delete('snapshot/:id')
  async deleteSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') id: string,
  ) {
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
        user,
        skip,
        limit,
        includedFields,
        sort,
      )
    ).map((r) => mapSnapshotToEmbeddableMap(r));
  }

  @ApiOperation({ description: 'Fetch a specific embeddable map' })
  @Get('snapshot/:id')
  async fetchSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const map = await this.locationService.fetchSnapshotById(user, id);

    map.updatedAt = new Date();
    await map.save();

    const realEstateListings =
      await this.realEstateListingService.fetchRealEstateListings(user);

    return mapSnapshotToEmbeddableMap(map, false, realEstateListings);
  }

  @ApiOperation({ description: 'Fetch Open AI location description' })
  @Post('ai-description')
  async fetchOpenAiLocationDescription(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() aiDescriptionQuery: ApiAiDescriptionQueryDto,
  ): Promise<string> {
    // TODO think about moving everything to the UserSubscriptionPipe
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.openAi &&
        !subscriptionPlan.appFeatures.openAi,
      'Das Open AI Feature ist im aktuellen Plan nicht verfügbar',
    );

    const searchResultSnapshot = await this.locationService.fetchSnapshotById(
      user,
      aiDescriptionQuery.searchResultSnapshotId,
    );

    const openAiText = this.openAiService.getLocationDescriptionQueryText({
      snapshot: searchResultSnapshot.snapshot,
      meanOfTransportation: aiDescriptionQuery.meanOfTransportation,
      tonality: openAiTonalities[aiDescriptionQuery.tonality],
      customText: aiDescriptionQuery.customText,
    });

    return this.openAiService.fetchTextCompletion(
      openAiText,
      openAiTextLength[aiDescriptionQuery.textLength].value,
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { LocationService } from './location.service';
import { mapSearchResultSnapshotToApiEmbeddableMap } from './mapper/embeddable-maps.mapper';
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
import { MeansOfTransportation } from '@area-butler-types/types';
import { OpenAiTonalityEnum } from '@area-butler-types/open-ai';
import { OpenAiService } from '../client/open-ai/open-ai.service';
import { openAiFeatureAllowedEmails } from '../../../shared/constants/exclusion';
import { openAiTonalities } from '../../../shared/constants/open-ai';

@ApiTags('location')
@Controller('api/location')
export class LocationController extends AuthenticatedController {
  constructor(
    private locationService: LocationService,
    private realEstateListingService: RealEstateListingService,
    private subscriptionService: SubscriptionService,
    private openAiService: OpenAiService,
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
    @Body() search: ApiSearchDto,
  ): Promise<ApiSearchResponseDto> {
    return this.locationService.searchLocation(user, search);
  }

  @ApiOperation({ description: 'Create a new snapshot' })
  @Post('snapshot')
  async createSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.locationService.createSearchResultSnapshot(user, snapshot);
  }

  // TODO think about merging updateSnapshot and updateSnapshotDescription
  // TODO think about using class-transformer instead of a mapper
  @ApiOperation({ description: 'Update an existing snapshot' })
  @Put('snapshot/:id')
  async updateSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
    @Body() body: ApiUpdateSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return mapSearchResultSnapshotToApiEmbeddableMap(
      await this.locationService.updateSearchResultSnapshot(user, id, body),
    );
  }

  @ApiOperation({ description: 'Update an existing snapshot description' })
  @Put('snapshot/:id/description')
  async updateSnapshotDescription(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
    @Body() { description }: { description: string },
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return mapSearchResultSnapshotToApiEmbeddableMap(
      await this.locationService.updateSnapshotDescription(
        user,
        id,
        description,
      ),
    );
  }

  @ApiOperation({ description: 'Delete an existing snapshot' })
  @Delete('snapshot/:id')
  async deleteSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    await this.locationService.deleteSearchResultSnapshot(user, id);
  }

  @ApiOperation({ description: 'Query latest user requests' })
  @Get('latest-user-requests')
  async latestUserRequests(
    @InjectUser() user: UserDocument,
  ): Promise<ApiUserRequestsDto> {
    return this.locationService.latestUserRequests(user);
  }

  @ApiOperation({
    description: 'Query the embeddable maps for the current user',
  })
  @Get('user-embeddable-maps')
  async getEmbeddableMaps(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Req() request: Request,
  ): Promise<ApiSearchResultSnapshotResponseDto[]> {
    const includedFields = {
      token: 1,
      description: 1,
      config: 1,
      createdAt: 1,
      endsAt: 1,
      lastAccess: 1,
      'snapshot.location': 1,
      'snapshot.description': 1,
      'snapshot.placesLocation.label': 1,
    };

    const sortOptions = { lastAccess: -1, createdAt: -1 };

    return (
      await this.locationService.fetchEmbeddableMaps(
        user,
        Number(request.query.skip) || 0,
        Number(request.query.limit) || 0,
        includedFields,
        sortOptions,
      )
    ).map((r) => mapSearchResultSnapshotToApiEmbeddableMap(r));
  }

  @ApiOperation({ description: 'Get a specific embeddable map' })
  @Get('user-embeddable-maps/:id')
  async getEmbeddableMap(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Param('id') id: string,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const map = await this.locationService.fetchEmbeddableMap(user, id);

    const realEstateListings =
      await this.realEstateListingService.getRealEstateListings(user);

    return mapSearchResultSnapshotToApiEmbeddableMap(
      map,
      false,
      realEstateListings,
    );
  }

  @ApiOperation({ description: 'Get Open AI location description' })
  @Get('open-ai-location-description')
  async getOpenAiLocationDescription(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query('searchResultSnapshotId') searchResultSnapshotId: string,
    @Query('meanOfTransportation') meanOfTransportation: MeansOfTransportation,
    @Query('tonality') tonality: OpenAiTonalityEnum,
  ): Promise<any> {
    // TODO allow by user email
    // await this.subscriptionService.checkSubscriptionViolation(
    //   user.subscription.type,
    //   (subscription) => !subscription.appFeatures.openAi,
    //   'Das Open AI Feature ist im aktuellen Plan nicht verfügbar',
    // );

    if (!openAiFeatureAllowedEmails.includes(user.email)) {
      throw new HttpException(
        'Das Open AI Feature ist im aktuellen Plan nicht verfügbar',
        400,
      );
    }

    const searchResultSnapshot = await this.locationService.fetchEmbeddableMap(
      user,
      searchResultSnapshotId,
    );

    const openAiText = this.openAiService.prepareLocationDescriptionQuery(
      searchResultSnapshot,
      meanOfTransportation,
      openAiTonalities.find(({ type }) => type === tonality).label ||
        openAiTonalities[0].label,
    );

    return this.openAiService.fetchTextCompletion(openAiText);
  }
}

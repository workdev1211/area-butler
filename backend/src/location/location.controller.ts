import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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

@ApiTags('location')
@Controller('api/location')
export class LocationController extends AuthenticatedController {
  constructor(
    private locationService: LocationService,
    private realEstateListingService: RealEstateListingService,
  ) {
    super();
  }

  @ApiOperation({
    description:
      'Search for a location, creates an entry in the "locationsearches" collection',
  })
  @Post('search')
  async searchLocation(
    @InjectUser() user: UserDocument,
    @Body() search: ApiSearchDto,
  ): Promise<ApiSearchResponseDto> {
    return this.locationService.searchLocation(user, search);
  }

  @ApiOperation({ description: 'Create a new snapshot' })
  @Post('snapshot')
  async createSnapshot(
    @InjectUser() user: UserDocument,
    @Body() snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.locationService.createSearchResultSnapshot(user, snapshot);
  }

  @ApiOperation({ description: 'Update an existing snapshot' })
  @Put('snapshot/:id')
  async updateSnapshot(
    @InjectUser() user: UserDocument,
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
    @InjectUser() user: UserDocument,
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
    @InjectUser() user: UserDocument,
    @Req() request: Request,
  ): Promise<ApiSearchResultSnapshotResponseDto[]> {
    const includedFields = {
      token: 1,
      description: 1,
      config: 1,
      createdAt: 1,
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
    @InjectUser() user: UserDocument,
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
}

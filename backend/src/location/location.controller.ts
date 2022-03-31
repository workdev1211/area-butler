import {
  ApiSearch,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotResponse,
  ApiUpdateSearchResultSnapshot,
  ApiUserRequests,
} from '@area-butler-types/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { LocationService } from './location.service';
import { mapSearchResultSnapshotToApiEmbeddableMap } from './mapper/embeddable-maps.mapper';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';

@Controller('api/location')
export class LocationController extends AuthenticatedController {
  constructor(
    private locationService: LocationService,
    private realEstateListingService: RealEstateListingService,
  ) {
    super();
  }

  @Post('search')
  async searchLocation(
    @InjectUser() user: UserDocument,
    @Body() search: ApiSearch,
  ): Promise<ApiSearchResponse> {
    return this.locationService.searchLocation(user, search);
  }

  @Post('snapshot')
  async createSnapshot(
    @InjectUser() user: UserDocument,
    @Body() snapshot: ApiSearchResultSnapshot,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.locationService.createSearchResultSnapshot(user, snapshot);
  }

  @Put('snapshot/:id')
  async updateSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') id: string,
    @Body() body: ApiUpdateSearchResultSnapshot,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return mapSearchResultSnapshotToApiEmbeddableMap(
      await this.locationService.updateSearchResultSnapshot(user, id, body),
    );
  }

  @Put('snapshot/:id/description')
  async updateSnapshotDescription(
    @InjectUser() user: UserDocument,
    @Param('id') id: string,
    @Body() { description }: { description: string },
  ): Promise<ApiSearchResultSnapshotResponse> {
    return mapSearchResultSnapshotToApiEmbeddableMap(
      await this.locationService.updateSnapshotDescription(
        user,
        id,
        description,
      ),
    );
  }

  @Delete('snapshot/:id')
  async deleteSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    await this.locationService.deleteSearchResultSnapshot(user, id);
  }

  @Get('latest-user-requests')
  async latestUserRequests(
    @InjectUser() user: UserDocument,
  ): Promise<ApiUserRequests> {
    return this.locationService.latestUserRequests(user);
  }

  @Get('user-embeddable-maps')
  async getEmbeddableMaps(
    @InjectUser() user: UserDocument,
  ): Promise<ApiSearchResultSnapshotResponse[]> {
    return (await this.locationService.fetchEmbeddableMaps(user)).map((r) =>
      mapSearchResultSnapshotToApiEmbeddableMap(r),
    );
  }

  @Get('user-embeddable-maps/:id')
  async getEmbeddableMap(
    @InjectUser() user: UserDocument,
    @Param('id') id: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
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

import {
  ApiSearch,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotResponse,
  ApiUserRequests,
} from '@area-butler-types/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { LocationService } from './location.service';
import { mapSearchResultSnapshotToApiEmbeddableMap } from './mapper/embeddable-maps.mapper';

@Controller('api/location')
export class LocationController extends AuthenticatedController {
  constructor(private locationService: LocationService) {
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
    return (await this.locationService.fetchEmbeddableMaps(user)).map(r =>
      mapSearchResultSnapshotToApiEmbeddableMap(r),
    );
  }
}

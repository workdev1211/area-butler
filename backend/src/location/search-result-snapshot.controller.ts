import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';


@Controller('api/location/snapshot')
export class SearchResultSnapshotController {
  constructor(private locationService: LocationService) {}

  @Get(':token')
  async fetchSnapshot(
    @Param('token') token: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.locationService.fetchSearchResultSnapshot(token);
  }
}

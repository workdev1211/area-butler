import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { mapSearchResultSnapshotToApiEmbeddableMap } from './mapper/embeddable-maps.mapper';


@Controller('api/location/snapshot')
export class SearchResultSnapshotController {
  constructor(private locationService: LocationService) {}

  @Get(':token')
  async fetchSnapshot(
    @Param('token') token: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return mapSearchResultSnapshotToApiEmbeddableMap( await this.locationService.fetchSearchResultSnapshot(token), true);
  }
}

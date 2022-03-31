import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { mapSearchResultSnapshotToApiEmbeddableMap } from './mapper/embeddable-maps.mapper';
import { UserService } from '../user/user.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import ApiSearchResultSnapshotResponseDto from '../dto/api-search-result-snapshot-response.dto';

@ApiTags('search-result-snapshot')
@Controller('api/location/snapshot')
export class SearchResultSnapshotController {
  constructor(
    private locationService: LocationService,
    private userService: UserService,
    private realEstateListingService: RealEstateListingService,
  ) {}

  @ApiOperation({ description: 'Get a snapshot' })
  @Get(':token')
  async fetchSnapshot(
    @Param('token') token: string,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const snapshot = await this.locationService.fetchSearchResultSnapshot(
      token,
    );
    const { userId } = snapshot;
    const user = await this.userService.findById(userId);
    const realEstateListings = await this.realEstateListingService.getRealEstateListings(
      user,
    );
    return mapSearchResultSnapshotToApiEmbeddableMap(
      snapshot,
      true,
      realEstateListings,
    );
  }
}

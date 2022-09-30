import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationService } from './location.service';
import { mapSnapshotToEmbeddableMap } from './mapper/embeddable-maps.mapper';
import { UserService } from '../user/user.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import ApiSearchResultSnapshotResponseDto from '../dto/api-search-result-snapshot-response.dto';
import { SubscriptionService } from '../user/subscription.service';
import { subscriptionExpiredMessage } from '../../../shared/messages/error.message';

@ApiTags('embedded-map')
@Controller('api/location/snapshot/iframe')
export class EmbeddedMapController {
  constructor(
    private locationService: LocationService,
    private userService: UserService,
    private realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @ApiOperation({ description: 'Fetch an embedded map' })
  @Get(':token')
  async fetchEmbeddedMap(
    @Param('token') token: string,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const snapshot = await this.locationService.fetchEmbeddedMap(token);
    const { userId } = snapshot;
    const user = await this.userService.findById(userId);

    if (!(await this.subscriptionService.findActiveByUserId(userId))) {
      throw new HttpException(subscriptionExpiredMessage, 402);
    }

    const realEstateListings =
      await this.realEstateListingService.fetchRealEstateListings(user);

    return mapSnapshotToEmbeddableMap(snapshot, true, realEstateListings);
  }
}

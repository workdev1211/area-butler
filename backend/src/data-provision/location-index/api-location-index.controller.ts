import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationIndexService } from './location-index.service';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { UserSubscriptionPipe } from '../../pipe/user-subscription.pipe';
import { ApiKeyAuthController } from '../../shared/api-key-auth.controller';
import ApiLocIndexQueryReqDto from '../dto/api-loc-index-query-req.dto';
import { GoogleGeocodeService } from '../../client/google/google-geocode.service';
import { ApiLocationIndexFeaturePropertiesEnum } from '@area-butler-types/location-index';

@ApiTags('location-index', 'api')
@Controller('api/api-location-index')
export class ApiLocationIndexController extends ApiKeyAuthController {
  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Query for location index data' })
  @Get('query')
  async query(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query() { lat, lng, address, type }: ApiLocIndexQueryReqDto,
  ): Promise<Record<ApiLocationIndexFeaturePropertiesEnum, number> | string> {
    // Due to the specifics of GeoJson, longitude comes first, then latitude
    const coordinates: Array<number | string> = [];

    if (lat && lng) {
      coordinates.push(lng, lat);
    }

    if ((!lat || !lng) && address) {
      const place = await this.googleGeocodeService.fetchPlace(address);

      coordinates.push(
        place.geometry.location.lng,
        place.geometry.location.lat,
      );
    }

    const locationIndexData = await this.locationIndexService.findIntersecting(
      user,
      {
        coordinates,
        type: type || 'Point',
      },
    );

    if (locationIndexData[0]) {
      return locationIndexData[0].properties;
    }

    return 'Location indices not found!';
  }
}

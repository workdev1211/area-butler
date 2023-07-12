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
import {
  ApiRequestStatusesEnum,
  ApiUserUsageStatsTypesEnum,
  IApiLocIndexQueryReqStatus,
} from '@area-butler-types/types';
import { UserService } from '../../user/user.service';

@ApiTags('location-index', 'api')
@Controller('api/location-index-ext')
export class LocationIndexExtController extends ApiKeyAuthController {
  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly userService: UserService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Query for location index data' })
  @Get('query')
  async query(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query() locationIndexQueryReq: ApiLocIndexQueryReqDto,
  ): Promise<Record<ApiLocationIndexFeaturePropertiesEnum, number> | string> {
    const { lat, lng, address, type } = locationIndexQueryReq;
    // Due to the specifics of GeoJson, longitude comes first, then latitude
    const coordinates: number[] = [];

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

    const requestStatus: IApiLocIndexQueryReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: locationIndexQueryReq,
      coordinates: { lat: coordinates[1], lng: coordinates[0] },
    };

    try {
      const locationIndexData =
        await this.locationIndexService.findIntersecting(user, {
          coordinates,
          type: type || 'Point',
        });

      if (locationIndexData[0]) {
        return locationIndexData[0].properties;
      }

      return 'Location indices not found!';
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
      requestStatus.message = e.message;
    } finally {
      await this.userService.logUsageStatistics(
        user,
        ApiUserUsageStatsTypesEnum.LOCATION_INDICES,
        requestStatus,
      );
    }
  }
}

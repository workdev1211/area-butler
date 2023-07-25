import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationIndexService } from './location-index.service';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { UserSubscriptionPipe } from '../../pipe/user-subscription.pipe';
import { ApiKeyAuthController } from '../../shared/api-key-auth.controller';
import { GoogleGeocodeService } from '../../client/google/google-geocode.service';
import {
  ApiCoordinates,
  ApiRequestStatusesEnum,
} from '@area-butler-types/types';
import { UsageStatisticsService } from '../../user/usage-statistics.service';
import ApiQueryLocIndicesReqDto from '../dto/api-query-loc-indices-req.dto';
import {
  ApiUsageStatsTypesEnum,
  IApiQueryLocIndicesReqStatus,
  IApiQueryLocIndicesRes,
} from '@area-butler-types/external-api';

@ApiTags('location-index', 'api')
@Controller('api/location-index-ext')
export class LocationIndexExtController extends ApiKeyAuthController {
  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Query for location index data' })
  @Get('query')
  async query(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query() queryLocIndicesReq: ApiQueryLocIndicesReqDto,
  ): Promise<IApiQueryLocIndicesRes | string> {
    const { lat, lng, address, type } = queryLocIndicesReq;
    // Due to the specifics of GeoJson, longitude comes first, then latitude
    const geoJsonCoordinates: number[] = [];

    if (address) {
      const place = await this.googleGeocodeService.fetchPlace(address);

      geoJsonCoordinates.push(
        place.geometry.location.lng,
        place.geometry.location.lat,
      );
    }

    if (!address && lat && lng) {
      geoJsonCoordinates.push(lng, lat);
    }

    const coordinates: ApiCoordinates = {
      lat: geoJsonCoordinates[1],
      lng: geoJsonCoordinates[0],
    };

    const requestStatus: IApiQueryLocIndicesReqStatus = {
      coordinates,
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: queryLocIndicesReq,
    };

    try {
      const locationIndexData =
        await this.locationIndexService.findIntersecting(user, {
          coordinates: geoJsonCoordinates,
          type: type || 'Point',
        });

      if (locationIndexData[0]) {
        return {
          input: { coordinates },
          result: locationIndexData[0].properties,
        };
      }

      return 'Location indices not found!';
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
      requestStatus.message = e.message;

      return e.message;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.LOCATION_INDICES,
        requestStatus,
      );
    }
  }
}

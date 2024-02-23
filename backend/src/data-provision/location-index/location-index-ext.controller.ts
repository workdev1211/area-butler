import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationIndexService } from './location-index.service';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { UserSubscriptionPipe } from '../../pipe/user-subscription.pipe';
import { ApiKeyAuthController } from '../../shared/api-key-auth.controller';
import { GoogleApiService } from '../../client/google/google-api.service';
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
} from '../../shared/types/external-api';

@ApiTags('location-index', 'api')
@Controller('api/location-index-ext')
export class LocationIndexExtController extends ApiKeyAuthController {
  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly googleApiService: GoogleApiService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Query for location index data' })
  @Get('query')
  async query(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query() queryLocIndicesReq: ApiQueryLocIndicesReqDto,
  ): Promise<IApiQueryLocIndicesRes> {
    const { lat, lng, address, type } = queryLocIndicesReq;
    // Due to the specifics of GeoJson, longitude comes first, then latitude
    const geoJsonCoordinates: number[] = [];

    if (address) {
      const place = await this.googleApiService.fetchPlaceOrFail(address);

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
      const locationIndexData = await this.locationIndexService.queryWithUser(
        user,
        {
          coordinates: geoJsonCoordinates,
          type: type || 'Point',
        },
      );

      if (locationIndexData[0]) {
        return {
          input: { coordinates },
          result: locationIndexData[0].properties,
        };
      }

      throw new HttpException('Location indices not found!', 400);
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
      requestStatus.message = e.message;

      throw e;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.LOCATION_INDICES,
        requestStatus,
      );
    }
  }
}

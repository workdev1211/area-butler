import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationIndexService } from './location-index.service';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { ApiKeyAuthController } from '../../shared/api-key-auth.controller';
import { ApiCoordinates, ResultStatusEnum } from '@area-butler-types/types';
import { UsageStatisticsService } from '../../user/service/usage-statistics.service';
import ApiQueryLocIndicesReqDto from '../dto/api-query-loc-indices-req.dto';
import {
  ApiUsageStatsTypesEnum,
  IApiQueryLocIndicesReqStatus,
  IApiQueryLocIndicesRes,
} from '../../shared/types/external-api';
import { PlaceService } from '../../place/place.service';

@ApiTags('location-index', 'api')
@Controller('api/location-index-ext')
export class LocationIndexExtController extends ApiKeyAuthController {
  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly placeService: PlaceService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Query for location index data' })
  @Get('query')
  async query(
    @InjectUser() user: UserDocument,
    @Query() queryLocIndicesReq: ApiQueryLocIndicesReqDto,
  ): Promise<IApiQueryLocIndicesRes> {
    const { lat, lng, address, type } = queryLocIndicesReq;
    // Due to the specifics of GeoJson, longitude comes first, then latitude
    const geoJsonCoordinates: number[] = [];

    if (address) {
      const place = await this.placeService.fetchPlaceOrFail({
        user,
        location: address,
      });

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
      status: ResultStatusEnum.SUCCESS,
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
      requestStatus.status = ResultStatusEnum.FAILURE;
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

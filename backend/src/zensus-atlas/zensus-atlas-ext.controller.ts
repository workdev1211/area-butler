import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ZensusAtlasService } from './zensus-atlas.service';
import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import {
  ApiCoordinates,
  ApiRequestStatusesEnum,
} from '@area-butler-types/types';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import { UsageStatisticsService } from '../user/usage-statistics.service';
import {
  ApiUsageStatsTypesEnum,
  IApiQueryLocIndicesReqStatus,
  IApiQueryZensusAtlasRes,
} from '@area-butler-types/external-api';
import { calculateRelevantArea } from '../shared/geo-json.functions';
import ApiCoordinatesOrAddressDto from '../location/dto/api-coordinates-or-address.dto';
import {
  cleanCensusProperties,
  processCensusData,
} from '../../../shared/functions/census.functions';

@ApiTags('zensus-atlas', 'api')
@Controller('api/zensus-atlas-ext')
export class ZensusAtlasExtController extends ApiKeyAuthController {
  constructor(
    private readonly zensusAtlasService: ZensusAtlasService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Query for zensus atlas data' })
  @Get('query')
  async query(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query() queryZensusAtlasReq: ApiCoordinatesOrAddressDto,
  ): Promise<IApiQueryZensusAtlasRes> {
    const { lat, lng, address } = queryZensusAtlasReq;
    let coordinates: ApiCoordinates;

    if (address) {
      const place = await this.googleGeocodeService.fetchPlace(address);
      coordinates = { ...place.geometry.location };
    }

    if (!address && lat && lng) {
      coordinates = { lat, lng };
    }

    const requestStatus: IApiQueryLocIndicesReqStatus = {
      coordinates,
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: queryZensusAtlasReq,
    };

    try {
      const zensusAtlasData = await this.zensusAtlasService.findIntersecting(
        user,
        calculateRelevantArea(coordinates).geometry,
      );

      return {
        input: { coordinates },
        result: processCensusData(cleanCensusProperties(zensusAtlasData)),
      };
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
      requestStatus.message = e.message;

      throw e;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.ZENSUS_ATLAS,
        requestStatus,
      );
    }
  }
}

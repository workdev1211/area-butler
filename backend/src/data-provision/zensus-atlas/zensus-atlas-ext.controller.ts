import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ZensusAtlasService } from './zensus-atlas.service';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { ApiCoordinates, ResultStatusEnum } from '@area-butler-types/types';
import { ApiKeyAuthController } from '../../shared/api-key-auth.controller';
import { UsageStatisticsService } from '../../user/service/usage-statistics.service';
import {
  ApiUsageStatsTypesEnum,
  IApiQueryLocIndicesReqStatus,
  IApiQueryZensusAtlasRes,
} from '../../shared/types/external-api';
import { calculateRelevantArea } from '../../shared/functions/geo-json';
import ApiCoordinatesOrAddressDto from '../../location/dto/api-coordinates-or-address.dto';
import {
  cleanCensusProperties,
  processCensusData,
} from '../../../../shared/functions/census.functions';
import { PlaceService } from '../../place/place.service';

@ApiTags('zensus-atlas', 'api')
@Controller('api/zensus-atlas-ext')
export class ZensusAtlasExtController extends ApiKeyAuthController {
  constructor(
    private readonly zensusAtlasService: ZensusAtlasService,
    private readonly placeService: PlaceService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Query for zensus atlas data' })
  @Get('query')
  async query(
    @InjectUser() user: UserDocument,
    @Query() queryZensusAtlasReq: ApiCoordinatesOrAddressDto,
  ): Promise<IApiQueryZensusAtlasRes> {
    const { lat, lng, address } = queryZensusAtlasReq;
    let coordinates: ApiCoordinates;

    if (address) {
      const place = await this.placeService.fetchPlaceOrFail({
        user,
        location: address,
      });

      coordinates = { ...place.geometry.location };
    }

    if (!address && lat && lng) {
      coordinates = { lat, lng };
    }

    const requestStatus: IApiQueryLocIndicesReqStatus = {
      coordinates,
      status: ResultStatusEnum.SUCCESS,
      queryParams: queryZensusAtlasReq,
    };

    try {
      const zensusAtlasData = await this.zensusAtlasService.query(
        user,
        calculateRelevantArea(coordinates).geometry,
      );

      return {
        input: { coordinates },
        result: processCensusData(cleanCensusProperties(zensusAtlasData)),
      };
    } catch (e) {
      requestStatus.status = ResultStatusEnum.FAILURE;
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

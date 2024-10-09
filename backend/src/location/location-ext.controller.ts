import {
  Body,
  Controller,
  Get,
  HttpException,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { ApiCoordinates, ResultStatusEnum } from '@area-butler-types/types';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import ApiFetchAddrInRangeReqDto from './dto/api-fetch-addr-in-range-req.dto';
import { UsageStatisticsService } from '../user/service/usage-statistics.service';
import ApiCreateSnapshotFromTemplateDto from '../dto/api-create-snapshot-from-template.dto';
import { SnapshotExtService } from './snapshot-ext.service';
import { AddressesInRangeExtService } from './addresses-in-range-ext.service';
import ApiFetchPoiDataReqDto from './dto/api-fetch-poi-data-req.dto';
import { LocationExtService } from './location-ext.service';
import {
  ApiUsageStatsTypesEnum,
  IApiFetchAddrInRangeReqStatus,
  IApiFetchAddrInRangeRes,
  IApiFetchPoiDataReqStatus,
  IApiFetchPoiDataRes,
  IApiFetchSnapshotDataReqStatus,
  IApiFetchSnapshotDataRes,
} from '../shared/types/external-api';
import ApiFetchSnapshotDataReqDto from './dto/api-fetch-snapshot-data-req.dto';
import { createDirectLink } from '../shared/functions/shared';
import { PlaceService } from '../place/place.service';

@ApiTags('location', 'api')
@Controller('api/location-ext')
export class LocationExtController extends ApiKeyAuthController {
  constructor(
    private readonly addressesInRangeExtService: AddressesInRangeExtService,
    private readonly usageStatisticsService: UsageStatisticsService,
    private readonly snapshotExtService: SnapshotExtService,
    private readonly locationExtService: LocationExtService,
    private readonly placeService: PlaceService,
  ) {
    super();
  }

  @ApiOperation({
    description: 'Create a search result snapshot from a template',
  })
  @Post('snapshot-from-template')
  async createSnapshotFromTemplate(
    @InjectUser() user: UserDocument,
    @Body()
    { coordinates, address, snapshotId }: ApiCreateSnapshotFromTemplateDto,
  ): Promise<{ snapshotId: string; directLink: string }> {
    const snapshotResponse =
      await this.snapshotExtService.createSnapshotFromTemplate(
        user,
        coordinates || address,
        snapshotId,
      );

    return {
      directLink: createDirectLink(snapshotResponse),
      snapshotId: snapshotResponse.id,
    };
  }

  @ApiOperation({
    description: 'Create a search result snapshot and fetch its data',
  })
  @Post('snapshot-data')
  @UseGuards(ThrottlerGuard)
  @Throttle(1, 5) // ttl is given in seconds
  async fetchSnapshotData(
    @InjectUser() user: UserDocument,
    @Body()
    fetchSnapshotDataReq: ApiFetchSnapshotDataReqDto,
  ): Promise<IApiFetchSnapshotDataRes> {
    const requestStatus: IApiFetchSnapshotDataReqStatus = {
      status: ResultStatusEnum.SUCCESS,
      queryParams: fetchSnapshotDataReq,
    };

    try {
      return this.locationExtService.fetchSnapshotData(
        user,
        fetchSnapshotDataReq,
      );
    } catch (e) {
      requestStatus.status = ResultStatusEnum.FAILURE;
      requestStatus.message = e.message;

      if (e.response?.status === 429 && !(e instanceof HttpException)) {
        throw new HttpException(
          'Too many requests at a time! Please, try again later.',
          429,
        );
      }

      throw e;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.SNAPSHOT_DATA,
        requestStatus,
      );
    }
  }

  @ApiOperation({
    description:
      'Fetches all of the addresses around the central one within a specified range',
  })
  @Get('addresses-in-range')
  async fetchAddressesInRange(
    @InjectUser() user: UserDocument,
    @Query()
    fetchAddrInRangeReq: ApiFetchAddrInRangeReqDto,
  ): Promise<IApiFetchAddrInRangeRes> {
    const { lat, lng, address, radius, language, apiType } =
      fetchAddrInRangeReq;

    const requestStatus: IApiFetchAddrInRangeReqStatus = {
      status: ResultStatusEnum.SUCCESS,
      queryParams: fetchAddrInRangeReq,
    };

    try {
      const {
        coordinates,
        sourceAddress,
        returnedAddressesNumber,
        returnedAddresses,
        apiRequestsNumber,
        apiType: resultApiType,
      } = await this.addressesInRangeExtService.fetchAddressesInRange({
        apiType,
        radius,
        user,
        language,
        location: address || { lat, lng },
      });

      Object.assign(requestStatus, {
        sourceAddress,
        returnedAddressesNumber,
        apiRequestsNumber,
        apiType: resultApiType,
      });

      return {
        input: { coordinates },
        result: {
          addresses_number: returnedAddressesNumber,
          addresses: returnedAddresses,
        },
      };
    } catch (e) {
      requestStatus.status = ResultStatusEnum.FAILURE;
      requestStatus.message = e.message;

      if (e.response?.status === 429 && !(e instanceof HttpException)) {
        throw new HttpException(
          'Too many requests at a time! Please, try again later.',
          429,
        );
      }

      throw e;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.ADDRESSES_IN_RANGE,
        requestStatus,
      );
    }
  }

  @ApiOperation({
    description:
      'Fetches all of the addresses around the central one within a specified range',
  })
  @Get('poi-data')
  async fetchPoiData(
    @InjectUser() user: UserDocument,
    @Query()
    fetchPoiDataReq: ApiFetchPoiDataReqDto,
  ): Promise<IApiFetchPoiDataRes> {
    const { address, lat, lng, poiNumber, transportMode, distance, unit } =
      fetchPoiDataReq;

    const requestStatus: IApiFetchPoiDataReqStatus = {
      status: ResultStatusEnum.SUCCESS,
      queryParams: fetchPoiDataReq,
    };

    try {
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

      const poiData = await this.locationExtService.fetchPoiData({
        coordinates,
        poiNumber,
        transportMode,
        distance,
        unit,
      });

      Object.assign(requestStatus, { coordinates });

      return { input: { coordinates }, result: poiData };
    } catch (e) {
      requestStatus.status = ResultStatusEnum.FAILURE;
      requestStatus.message = e.message;

      if (e.response?.status === 429 && !(e instanceof HttpException)) {
        throw new HttpException(
          'Too many requests at a time! Please, try again later.',
          429,
        );
      }

      throw e;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.POI_DATA,
        requestStatus,
      );
    }
  }

  @ApiOperation({
    description: 'Updates POI data',
  })
  @Patch('poi-data')
  updatePoiData(): void {
    void this.locationExtService.updatePoiData();
  }
}

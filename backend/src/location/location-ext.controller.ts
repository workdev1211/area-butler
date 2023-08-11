import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import {
  ApiCoordinates,
  ApiRequestStatusesEnum,
} from '@area-butler-types/types';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import ApiFetchAddrInRangeReqDto from './dto/api-fetch-addr-in-range-req.dto';
import { UsageStatisticsService } from '../user/usage-statistics.service';
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
} from '@area-butler-types/external-api';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import ApiFetchSnapshotDataReqDto from './dto/api-fetch-snapshot-data-req.dto';
import { createDirectLink } from '../shared/shared.functions';

@ApiTags('location', 'api')
@Controller('api/location-ext')
export class LocationExtController extends ApiKeyAuthController {
  constructor(
    private readonly addressesInRangeExtService: AddressesInRangeExtService,
    private readonly usageStatisticsService: UsageStatisticsService,
    private readonly snapshotExtService: SnapshotExtService,
    private readonly locationExtService: LocationExtService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {
    super();
  }

  @ApiOperation({
    description: 'Create a search result snapshot from a template',
  })
  @Post('snapshot-from-template')
  async createSnapshotFromTemplate(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    { coordinates, address, snapshotId }: ApiCreateSnapshotFromTemplateDto,
  ): Promise<{ snapshotId: string; directLink: string }> {
    const { id, token } =
      await this.snapshotExtService.createSnapshotFromTemplate(
        user,
        coordinates || address,
        snapshotId,
      );

    return {
      snapshotId: id,
      directLink: createDirectLink(token),
    };
  }

  @ApiOperation({
    description: 'Create a search result snapshot and fetch its data',
  })
  @Post('snapshot-data')
  async fetchSnapshotData(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    fetchSnapshotDataReq: ApiFetchSnapshotDataReqDto,
  ): Promise<IApiFetchSnapshotDataRes> {
    const requestStatus: IApiFetchSnapshotDataReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: fetchSnapshotDataReq,
    };

    try {
      return this.locationExtService.fetchSnapshotData(
        user,
        fetchSnapshotDataReq,
      );
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
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
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query()
    fetchAddrInRangeReq: ApiFetchAddrInRangeReqDto,
  ): Promise<IApiFetchAddrInRangeRes> {
    const { lat, lng, address, radius, language, apiType } =
      fetchAddrInRangeReq;

    const requestStatus: IApiFetchAddrInRangeReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: fetchAddrInRangeReq,
    };

    try {
      const {
        coordinates,
        sourceAddress,
        returnedAddressesNumber,
        returnedAddresses,
        apiRequestsNumber,
      } = await this.addressesInRangeExtService.fetchAddressesInRange(
        address || { lat, lng },
        radius,
        apiType,
        language,
      );

      Object.assign(requestStatus, {
        sourceAddress,
        returnedAddressesNumber,
        apiRequestsNumber,
        apiType,
      });

      return {
        input: { coordinates },
        result: {
          addresses_number: returnedAddressesNumber,
          addresses: returnedAddresses,
        },
      };
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
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
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Query()
    fetchPoiDataReq: ApiFetchPoiDataReqDto,
  ): Promise<IApiFetchPoiDataRes> {
    const { address, lat, lng, poiNumber, transportMode, distance, unit } =
      fetchPoiDataReq;

    const requestStatus: IApiFetchPoiDataReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: fetchPoiDataReq,
    };

    try {
      let coordinates: ApiCoordinates;

      if (address) {
        const place = await this.googleGeocodeService.fetchPlace(address);
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
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
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
}

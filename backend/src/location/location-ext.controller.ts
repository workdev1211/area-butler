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
import { ApiRequestStatusesEnum } from '@area-butler-types/types';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import ApiFetchAddrInRangeReqDto from './dto/api-fetch-addr-in-range-req.dto';
import { UsageStatisticsService } from '../user/usage-statistics.service';
import ApiCreateSnapshotFromTemplateDto from '../dto/api-create-snapshot-from-template.dto';
import { configService } from '../config/config.service';
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
} from '@area-butler-types/external-api';

@ApiTags('location', 'api')
@Controller('api/location-ext')
export class LocationExtController extends ApiKeyAuthController {
  constructor(
    private readonly addressesInRangeExtService: AddressesInRangeExtService,
    private readonly usageStatisticsService: UsageStatisticsService,
    private readonly snapshotExtService: SnapshotExtService,
    private readonly locationExtService: LocationExtService,
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
      directLink: `${configService.getBaseAppUrl()}/embed?token=${token}`,
    };
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
  ): Promise<IApiFetchAddrInRangeRes | string> {
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

      return e.message;
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
  ): Promise<IApiFetchPoiDataRes | string> {
    const { address, lat, lng, transportMode, distance, unit } =
      fetchPoiDataReq;

    const requestStatus: IApiFetchPoiDataReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: fetchPoiDataReq,
    };

    try {
      const response = await this.locationExtService.fetchPoiData({
        location: address || { lat, lng },
        transportMode,
        distance,
        unit,
      });

      Object.assign(requestStatus, {
        coordinates: response.input.coordinates,
      });

      return response;
    } catch (e) {
      requestStatus.status = ApiRequestStatusesEnum.ERROR;
      requestStatus.message = e.message;

      if (e.response?.status === 429 && !(e instanceof HttpException)) {
        throw new HttpException(
          'Too many requests at a time! Please, try again later.',
          429,
        );
      }

      return e.message;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.POI_DATA,
        requestStatus,
      );
    }
  }
}

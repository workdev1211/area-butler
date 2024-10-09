// TODO REMOVE IN THE FUTURE

import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Language } from '@googlemaps/google-maps-services-js';

import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { AddressesInRangeExtService } from './addresses-in-range-ext.service';
import { ResultStatusEnum } from '@area-butler-types/types';
import ApiFetchAddrInRangeReqDto from './dto/api-fetch-addr-in-range-req.dto';
import { UsageStatisticsService } from '../user/service/usage-statistics.service';
import {
  ApiUsageStatsTypesEnum,
  IApiAddressInRange,
  IApiFetchAddrInRangeReqStatus,
} from '../shared/types/external-api';
import { Auth0ApiGuard } from '../auth/auth0/auth0-api.guard';

@ApiTags('api-address-range')
@Controller('api/addresses-in-range')
@UseGuards(AuthGuard('auth0-api'), Auth0ApiGuard)
export class ApiAddressesInRangeController {
  constructor(
    private readonly addressesInRangeService: AddressesInRangeExtService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {}

  @ApiOperation({
    description:
      'Fetches all of the addresses around the central one within a specified range',
  })
  @Get()
  async fetchAddressesInRange(
    @InjectUser() user: UserDocument,
    @Query()
    fetchAddrInRangeReq: ApiFetchAddrInRangeReqDto,
  ): Promise<{
    address_count: number;
    addresses: IApiAddressInRange[];
  }> {
    const { lat, lng, address, radius, language, apiType } =
      fetchAddrInRangeReq;

    const requestStatus: IApiFetchAddrInRangeReqStatus = {
      status: ResultStatusEnum.SUCCESS,
      queryParams: fetchAddrInRangeReq,
    };

    try {
      const {
        sourceAddress,
        returnedAddressesNumber,
        returnedAddresses,
        apiRequestsNumber,
      } = await this.addressesInRangeService.fetchAddressesInRange({
        apiType,
        radius,
        user,
        location: address || { lat, lng },
        language: Object.values<string>(Language).includes(language)
          ? (language as unknown as Language)
          : Language.de,
      });

      Object.assign(requestStatus, {
        sourceAddress,
        returnedAddressesNumber,
        apiRequestsNumber,
        apiType,
      });

      return {
        address_count: returnedAddressesNumber,
        addresses: returnedAddresses,
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
}

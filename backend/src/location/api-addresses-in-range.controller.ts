// TODO REMOVE IN THE FUTURE

import {
  Controller,
  Get,
  HttpException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { AddressesInRangeExtService } from './addresses-in-range-ext.service';
import { ApiRequestStatusesEnum } from '@area-butler-types/types';
import ApiFetchAddrInRangeReqDto from './dto/api-fetch-addr-in-range-req.dto';
import { UsageStatisticsService } from '../user/usage-statistics.service';
import {
  ApiUsageStatsTypesEnum,
  IApiAddressInRange,
  IApiFetchAddrInRangeReqStatus,
} from '@area-butler-types/external-api';
import { ApiGuard } from '../auth/api.guard';

@ApiTags('api-address-range')
@Controller('api/addresses-in-range')
@UseGuards(AuthGuard('auth0-api'), ApiGuard)
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
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Req() request: any,
    @Query()
    fetchAddrInRangeReq: ApiFetchAddrInRangeReqDto,
  ): Promise<{
    address_count: number;
    addresses: IApiAddressInRange[];
  }> {
    const { lat, lng, address, radius, language, apiType } =
      fetchAddrInRangeReq;

    const requestStatus: IApiFetchAddrInRangeReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: fetchAddrInRangeReq,
    };

    try {
      const {
        sourceAddress,
        returnedAddressesNumber,
        returnedAddresses,
        apiRequestsNumber,
      } = await this.addressesInRangeService.fetchAddressesInRange(
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
        address_count: returnedAddressesNumber,
        addresses: returnedAddresses,
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
}

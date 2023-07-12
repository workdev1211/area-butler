import { Controller, Get, HttpException, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { AddressesInRangeExtService } from './addresses-in-range-ext.service';
import { UserService } from '../user/user.service';
import {
  ApiRequestStatusesEnum,
  ApiUserUsageStatsTypesEnum,
  IApiAddressesInRangeResponse,
  IApiAddrInRangeReqStatus,
} from '@area-butler-types/types';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import ApiFetchAddrInRangeReqDto from './dto/api-fetch-addr-in-range-req.dto';

@ApiTags('addresses-in-range', 'api')
@Controller('api/addresses-in-range-ext')
export class AddressesInRangeExtController extends ApiKeyAuthController {
  constructor(
    private readonly addressesInRangeService: AddressesInRangeExtService,
    private readonly userService: UserService,
  ) {
    super();
  }

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
  ): Promise<IApiAddressesInRangeResponse> {
    const { lat, lng, address, radius, language, apiType } =
      fetchAddrInRangeReq;

    const requestStatus: IApiAddrInRangeReqStatus = {
      status: ApiRequestStatusesEnum.SUCCESS,
      queryParams: fetchAddrInRangeReq,
    };

    try {
      const {
        sourceAddress,
        returnedAddressesNumber,
        returnedAddresses,
        apiRequestsNumber,
        apiType: resultingApiType,
      } = await this.addressesInRangeService.fetchAddressesInRange(
        address || { lat, lng },
        radius,
        language,
        apiType,
      );

      Object.assign(requestStatus, {
        sourceAddress,
        returnedAddressesNumber,
        apiRequestsNumber,
        apiType: resultingApiType,
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
      await this.userService.logUsageStatistics(
        user,
        ApiUserUsageStatsTypesEnum.ADDRESSES_IN_RANGE,
        requestStatus,
      );
    }
  }
}

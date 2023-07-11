import { Controller, Get, HttpException, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ApiAddressesInRangeService } from './api-addresses-in-range.service';
import { UserService } from '../user/user.service';
import {
  IApiAddressesInRangeRequestStatus,
  IApiAddressesInRangeRequestStatusEnum,
  IApiAddressesInRangeResponse,
} from '@area-butler-types/types';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import ApiFetchAddrInRangeReqDto from './dto/api-fetch-addr-in-range-req.dto';

@ApiTags('addresses-in-range', 'api')
@Controller('api/api-addresses-in-range')
export class ApiAddressesInRangeController extends ApiKeyAuthController {
  constructor(
    private readonly addressesInRangeService: ApiAddressesInRangeService,
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
    const { lat, lng, address, radius, language, apiName } =
      fetchAddrInRangeReq;

    const requestStatus: IApiAddressesInRangeRequestStatus = {
      status: IApiAddressesInRangeRequestStatusEnum.SUCCESS,
      queryParams: JSON.stringify(fetchAddrInRangeReq),
    };

    try {
      const {
        sourceAddress,
        returnedAddressesNumber,
        returnedAddresses,
        requestType,
        requestsNumber,
      } = await this.addressesInRangeService.fetchAddressesInRange(
        address || { lat: +lat, lng: +lng },
        +radius,
        language,
        apiName,
      );

      Object.assign(requestStatus, {
        sourceAddress,
        returnedAddressesNumber,
        requestType,
        requestsNumber,
      });

      return {
        address_count: returnedAddressesNumber,
        addresses: returnedAddresses,
      };
    } catch (e) {
      requestStatus.status = IApiAddressesInRangeRequestStatusEnum.ERROR;
      requestStatus.message = e.message;

      if (e.response?.status === 429 && !(e instanceof HttpException)) {
        throw new HttpException(
          'Too many requests at a time! Please, try again later.',
          429,
        );
      }

      throw e;
    } finally {
      await this.userService.onAddressesInRangeFetch(user, requestStatus);
    }
  }
}

import {
  Controller,
  Get,
  HttpException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ApiGuard } from './api.guard';
import { ApiAddressesInRangeService } from './api-addresses-in-range.service';
import { AddressRadiusPipe } from './pipe/address-radius.pipe';
import { UserService } from '../user/user.service';
import {
  ApiAddressesInRangeApiNameEnum,
  IApiAddressesInRangeRequestStatus,
  IApiAddressesInRangeRequestStatusEnum,
  IApiAddressesInRangeResponse,
} from '@area-butler-types/types';
import { AddressApiNamePipe } from './pipe/address-api-name.pipe';
import { AddressLanguagePipe } from './pipe/address-language.pipe';
import { AddressCoordinatePipe } from './pipe/address-coordinate.pipe';

@ApiTags('api-address-range')
@Controller('api/addresses-in-range')
@UseGuards(AuthGuard('auth0-api'), ApiGuard)
export class ApiAddressesInRangeController {
  constructor(
    private readonly addressesInRangeService: ApiAddressesInRangeService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    description:
      'Gets all addresses around the central one within a specified range',
  })
  @Get()
  async getAddressesInRange(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Req() request: any,
    @Query('address') address?: string,
    @Query('lat', AddressCoordinatePipe) lat?: number,
    @Query('lng', AddressCoordinatePipe) lng?: number,
    @Query('radius', AddressRadiusPipe) radius?: number,
    @Query('language', AddressLanguagePipe) language?: string,
    @Query('api', AddressApiNamePipe) apiName?: ApiAddressesInRangeApiNameEnum,
  ): Promise<IApiAddressesInRangeResponse> {
    if (!address && (!lat || !lng)) {
      throw new HttpException(
        'Please, provide either an "address" or the coordinates ("lat", "lng") of the central point!',
        400,
      );
    }

    const parsedUrl = request.url.match(/^\/.*\?(.*)$/);

    const requestStatus: IApiAddressesInRangeRequestStatus = {
      status: IApiAddressesInRangeRequestStatusEnum.SUCCESS,
      queryParams: Array.isArray(parsedUrl) ? parsedUrl[1] : request.url,
    };

    try {
      // "await" is required in order to catch an error
      return await this.addressesInRangeService.getAddressesInRange(
        address || { lat, lng },
        radius,
        language,
        apiName,
      );
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

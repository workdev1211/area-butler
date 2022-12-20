import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { ApiAddressesInRangeApiNameEnum } from '@area-butler-types/types';

@Injectable()
export class AddressApiNamePipe implements PipeTransform {
  transform(
    api: ApiAddressesInRangeApiNameEnum,
  ): ApiAddressesInRangeApiNameEnum {
    if (!api) {
      return;
    }

    if (!Object.values(ApiAddressesInRangeApiNameEnum).includes(api)) {
      throw new HttpException(
        `The API name should be ${Object.values(
          ApiAddressesInRangeApiNameEnum,
        ).join(', ')}!`,
        400,
      );
    }

    return api;
  }
}

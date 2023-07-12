import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { ApiAddrInRangeApiTypesEnum } from '@area-butler-types/types';

@Injectable()
export class AddrInRangeApiTypePipe implements PipeTransform {
  transform(apiType: ApiAddrInRangeApiTypesEnum): ApiAddrInRangeApiTypesEnum {
    if (!apiType) {
      return;
    }

    if (!Object.values(ApiAddrInRangeApiTypesEnum).includes(apiType)) {
      throw new HttpException(
        `The API name should be ${Object.values(
          ApiAddrInRangeApiTypesEnum,
        ).join(', ')}!`,
        400,
      );
    }

    return apiType;
  }
}

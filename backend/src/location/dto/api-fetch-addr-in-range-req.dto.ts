import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiAddrInRangeApiTypesEnum,
  IApiFetchAddrInRangeReq,
} from '@area-butler-types/types';
import ApiCoordinatesOrAddressDto from './api-coordinates-or-address.dto';
import { ApiHereLanguageEnum } from '@area-butler-types/here';

class ApiFetchAddrInRangeReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiFetchAddrInRangeReq
{
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(400)
  radius?: number;

  @IsOptional()
  @IsEnum(ApiHereLanguageEnum, {
    message: "language should be BCP 47 compliant (e.g., 'de')",
  })
  language?: ApiHereLanguageEnum;

  @IsOptional()
  @IsEnum(ApiAddrInRangeApiTypesEnum)
  apiType?: ApiAddrInRangeApiTypesEnum;
}

export default ApiFetchAddrInRangeReqDto;

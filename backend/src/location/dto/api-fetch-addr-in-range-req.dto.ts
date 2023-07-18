import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

import ApiCoordinatesOrAddressDto from './api-coordinates-or-address.dto';
import { ApiHereLanguageEnum } from '@area-butler-types/here';
import {
  ApiAddrInRangeApiTypesEnum,
  IApiFetchAddrInRangeReq,
} from '@area-butler-types/external-api';

class ApiFetchAddrInRangeReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiFetchAddrInRangeReq
{
  @IsOptional()
  @Transform(({ value }) => +value, { toClassOnly: true })
  @IsInt()
  @Min(1)
  @Max(400)
  radius?: number = 150;

  @IsOptional()
  @IsEnum(ApiHereLanguageEnum, {
    message: "language should be BCP 47 compliant (e.g., 'de')",
  })
  language?: ApiHereLanguageEnum;

  @IsOptional()
  @IsEnum(ApiAddrInRangeApiTypesEnum)
  apiType?: ApiAddrInRangeApiTypesEnum = ApiAddrInRangeApiTypesEnum.HERE;
}

export default ApiFetchAddrInRangeReqDto;

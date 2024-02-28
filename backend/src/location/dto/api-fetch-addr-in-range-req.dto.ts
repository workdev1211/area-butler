import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { Language } from '@googlemaps/google-maps-services-js';

import ApiCoordinatesOrAddressDto from './api-coordinates-or-address.dto';
import {
  ApiAddrInRangeApiTypesEnum,
  IApiFetchAddrInRangeReq,
} from '../../shared/types/external-api';

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
  @IsEnum(Language, {
    message: "language should be BCP 47 compliant (e.g., 'de')",
  })
  language?: Language = Language.de;

  @IsOptional()
  @IsEnum(ApiAddrInRangeApiTypesEnum)
  apiType?: ApiAddrInRangeApiTypesEnum = ApiAddrInRangeApiTypesEnum.HERE;
}

export default ApiFetchAddrInRangeReqDto;

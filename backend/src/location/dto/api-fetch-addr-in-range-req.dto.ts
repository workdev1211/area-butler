import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

import {
  ApiAddressesInRangeApiNameEnum,
  IApiFetchAddrInRangeReq,
} from '@area-butler-types/types';
import ApiCoordinatesOrAddressDto from './api-coordinates-or-address.dto';

class ApiFetchAddrInRangeReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiFetchAddrInRangeReq
{
  @IsOptional()
  @IsNumberString()
  radius?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(ApiAddressesInRangeApiNameEnum)
  apiName?: ApiAddressesInRangeApiNameEnum;
}

export default ApiFetchAddrInRangeReqDto;

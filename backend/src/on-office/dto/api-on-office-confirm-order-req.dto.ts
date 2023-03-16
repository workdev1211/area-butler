import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiOnOfficeConfirmOrderQueryParams,
  IApiOnOfficeConfirmOrderReq,
} from '@area-butler-types/on-office';
import ApiOnOfficeConfirmOrderQueryParamsDto from './api-on-office-confirm-order-query-params.dto';

class ApiOnOfficeConfirmOrderReqDto implements IApiOnOfficeConfirmOrderReq {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  extendedClaim: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOnOfficeConfirmOrderQueryParamsDto)
  onOfficeQueryParams: IApiOnOfficeConfirmOrderQueryParams;
}

export default ApiOnOfficeConfirmOrderReqDto;

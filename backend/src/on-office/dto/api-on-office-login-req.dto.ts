import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeLoginReq,
} from '@area-butler-types/on-office';
import ApiOnOfficeLoginQueryParamsDto from './api-on-office-login-query-params.dto';

class ApiOnOfficeLoginReqDto implements IApiOnOfficeLoginReq {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOnOfficeLoginQueryParamsDto)
  onOfficeQueryParams: IApiOnOfficeLoginQueryParams;
}

export default ApiOnOfficeLoginReqDto;

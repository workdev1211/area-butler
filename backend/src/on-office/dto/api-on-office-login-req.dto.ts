import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeLoginReq,
} from '@area-butler-types/on-office';
import ApiOnOfficeLoginQueryParamsDto from './api-on-office-login-query-params.dto';

@Exclude()
class ApiOnOfficeLoginReqDto implements IApiOnOfficeLoginReq {
  @Expose()
  @IsNotEmpty()
  @IsString()
  url: string;

  @Expose()
  @Type(() => ApiOnOfficeLoginQueryParamsDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  onOfficeQueryParams: IApiOnOfficeLoginQueryParams;
}

export default ApiOnOfficeLoginReqDto;

import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiUserApiConnectSettingsReq } from '@area-butler-types/types';
import { ApiRealEstateExtSourcesEnum } from '@area-butler-types/real-estate';

@Exclude()
class ApiUserApiConnectSettingsReqDto implements IApiUserApiConnectSettingsReq {
  @Expose()
  @IsNotEmpty()
  @IsEnum(ApiRealEstateExtSourcesEnum)
  connectType: ApiRealEstateExtSourcesEnum;

  @Expose()
  @IsOptional()
  @IsString()
  apiKey?: string;

  @Expose()
  @IsOptional()
  @IsString()
  token?: string;

  @Expose()
  @IsOptional()
  @IsString()
  secret?: string;
}

export default ApiUserApiConnectSettingsReqDto;

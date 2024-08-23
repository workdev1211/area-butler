import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ApiRealEstateExtSourcesEnum } from '@area-butler-types/real-estate';
import { IApiUserExtConnectSettingsReq } from '@area-butler-types/types';

@Exclude()
class ApiUserExtConnectSettingsReqDto implements IApiUserExtConnectSettingsReq {
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

export default ApiUserExtConnectSettingsReqDto;

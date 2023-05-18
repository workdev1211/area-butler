import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiUserApiConnectionSettingsReq } from '@area-butler-types/types';
import { ApiRealEstateExtSourcesEnum } from '@area-butler-types/real-estate';

@Exclude()
class ApiUserApiConnectionSettingsReqDto
  implements IApiUserApiConnectionSettingsReq
{
  @Expose()
  @IsNotEmpty()
  @IsEnum(ApiRealEstateExtSourcesEnum)
  connectionType: ApiRealEstateExtSourcesEnum;

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

export default ApiUserApiConnectionSettingsReqDto;

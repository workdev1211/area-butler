import { IsOptional, IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

import { TApiUserApiConnectSettings } from '@area-butler-types/types';

@Exclude()
class ApiUserApiConnectSettingsDto implements TApiUserApiConnectSettings {
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

export default ApiUserApiConnectSettingsDto;

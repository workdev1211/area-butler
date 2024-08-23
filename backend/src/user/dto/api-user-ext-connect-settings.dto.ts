import { IsOptional, IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

import { TApiUserExtConnectSettings } from '@area-butler-types/types';

@Exclude()
class ApiUserExtConnectSettingsDto implements TApiUserExtConnectSettings {
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

export default ApiUserExtConnectSettingsDto;

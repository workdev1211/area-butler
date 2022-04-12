import { ApiConfig } from '@area-butler-types/types';
import RollbarConfigDto from './rollbar-config.dto';

import { IsNotEmpty, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ApiConfigDto implements ApiConfig {

  @IsNotEmpty()
  auth: { clientId: string; domain: string };

  @IsNotEmpty()
  googleApiKey: string;

  @IsNotEmpty()
  mapBoxAccessToken: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RollbarConfigDto)
  rollbarConfig: RollbarConfigDto;

  @IsNotEmpty()
  @IsIn(['dev', 'prod'])
  stripeEnv: 'dev' | 'prod';
}

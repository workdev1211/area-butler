import {IsNotEmpty, IsIn, ValidateNested, IsString} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiConfig } from '@area-butler-types/types';
import RollbarConfigDto from './rollbar-config.dto';

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

  @IsNotEmpty()
  @IsString()
  paypalClientId: string;
}

import { IsNotEmpty, IsIn, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiConfig,
  TPaymentEnvironment,
  TSystemEnvironment,
} from '@area-butler-types/types';
import RollbarConfigDto from './rollbar-config.dto';
import {
  paymentEnvironments,
  systemEnvironments,
} from '../../../shared/constants/constants';

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
  @IsIn(systemEnvironments)
  systemEnv: TSystemEnvironment;

  @IsNotEmpty()
  @IsIn(paymentEnvironments)
  stripeEnv: TPaymentEnvironment;

  @IsNotEmpty()
  @IsString()
  paypalClientId: string;
}

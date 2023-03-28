import {
  IsNotEmpty,
  IsIn,
  ValidateNested,
  IsString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiConfig,
  IApiSentryConfig,
  TPaymentEnvironment,
  TSystemEnvironment,
} from '@area-butler-types/types';
import RollbarConfigDto from './rollbar-config.dto';
import {
  paymentEnvironments,
  systemEnvironments,
} from '../../../shared/constants/constants';
import { ApiSentryConfigDto } from './api-sentry-config.dto';

export class ApiConfigDto implements ApiConfig {
  @IsNotEmpty()
  @IsObject()
  auth: { clientId: string; domain: string };

  @IsNotEmpty()
  @IsString()
  googleApiKey: string;

  @IsNotEmpty()
  @IsString()
  mapBoxAccessToken: string;

  @IsNotEmpty()
  @IsObject()
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

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSentryConfigDto)
  sentry: IApiSentryConfig;
}

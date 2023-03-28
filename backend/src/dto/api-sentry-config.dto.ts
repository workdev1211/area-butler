import { IsNotEmpty, IsString } from 'class-validator';

import { IApiSentryConfig } from '@area-butler-types/types';

export class ApiSentryConfigDto implements IApiSentryConfig {
  @IsNotEmpty()
  @IsString()
  dsn: string;

  @IsNotEmpty()
  @IsString()
  environment: string;
}

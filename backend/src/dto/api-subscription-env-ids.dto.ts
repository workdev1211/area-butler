import { IsOptional, IsString } from 'class-validator';

import { IApiSubscriptionEnvIds } from '@area-butler-types/subscription-plan';

class ApiSubscriptionEnvIdsDto implements IApiSubscriptionEnvIds {
  @IsOptional()
  @IsString()
  dev?: string;

  @IsOptional()
  @IsString()
  prod?: string;
}

export default ApiSubscriptionEnvIdsDto;

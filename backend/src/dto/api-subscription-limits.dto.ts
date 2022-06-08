import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiSubscriptionLimit,
  TApiSubscriptionLimits,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionLimitDto from './api-subscription-limit.dto';

class ApiSubscriptionLimitsDto implements TApiSubscriptionLimits {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitDto)
  numberOfRequests?: IApiSubscriptionLimit;
}

export default ApiSubscriptionLimitsDto;

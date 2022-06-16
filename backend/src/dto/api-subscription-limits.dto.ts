import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSubscriptionLimitsEnum,
  IApiSubscriptionLimit,
  IApiSubscriptionLimits,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionLimitDto from './api-subscription-limit.dto';

class ApiSubscriptionLimitsDto implements IApiSubscriptionLimits {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitDto)
  [ApiSubscriptionLimitsEnum.NumberOfRequests]?: IApiSubscriptionLimit;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitDto)
  [ApiSubscriptionLimitsEnum.AddressExpiration]?: IApiSubscriptionLimit;
}

export default ApiSubscriptionLimitsDto;

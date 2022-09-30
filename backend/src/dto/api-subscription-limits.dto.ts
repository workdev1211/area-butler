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
  [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]?: IApiSubscriptionLimit;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitDto)
  [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]?: IApiSubscriptionLimit;
}

export default ApiSubscriptionLimitsDto;

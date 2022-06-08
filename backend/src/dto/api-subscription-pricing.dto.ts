import {
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsString,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionPricing,
  IApiSubscriptionEnvIds,
  TApiSubscriptionLimits,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionLimitsDto from './api-subscription-limits.dto';
import ApiSubscriptionEnvIdsDto from './api-subscription-env-ids.dto';

class ApiSubscriptionPricingDto implements ApiSubscriptionPricing {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionEnvIdsDto)
  id: IApiSubscriptionEnvIds;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  price: string;

  @IsNotEmpty()
  @IsEnum(ApiSubscriptionIntervalEnum)
  interval: ApiSubscriptionIntervalEnum;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitsDto)
  limits?: TApiSubscriptionLimits;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  description?: string[];
}

export default ApiSubscriptionPricingDto;

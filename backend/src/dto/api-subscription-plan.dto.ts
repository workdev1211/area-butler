import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
  IApiSubscriptionEnvIds,
  IApiSubscriptionLimits,
  IApiSubscriptionPlanAppFeatures,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionPricingDto from './api-subscription-pricing.dto';
import ApiSubscriptionLimitsDto from './api-subscription-limits.dto';
import ApiSubscriptionEnvIdsDto from './api-subscription-env-ids.dto';
import ApiSubscriptionPlanAppFeaturesDto from './api-subscription-plan-app-features.dto';

class ApiSubscriptionPlanDto implements ApiSubscriptionPlan {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionEnvIdsDto)
  id?: IApiSubscriptionEnvIds;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(ApiSubscriptionPlanType)
  type: ApiSubscriptionPlanType;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested()
  @Type(() => ApiSubscriptionPricingDto)
  prices: ApiSubscriptionPricingDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitsDto)
  limits?: IApiSubscriptionLimits;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  description?: string[];

  @IsOptional()
  @IsString()
  footnote?: string;

  @IsOptional()
  @IsString()
  purchaseButtonLabel?: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionPlanAppFeaturesDto)
  appFeatures: IApiSubscriptionPlanAppFeatures;
}

export default ApiSubscriptionPlanDto;

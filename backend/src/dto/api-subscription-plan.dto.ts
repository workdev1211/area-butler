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
  ApiDataSource,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
  TApiSubscriptionLimits,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionPricingDto from './api-subscription-pricing.dto';
import ApiSubscriptionLimitsDto from './api-subscription-limits.dto';

class ApiSubscriptionPlanDto implements ApiSubscriptionPlan {
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
  limits?: TApiSubscriptionLimits;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  description?: string[];

  @IsNotEmpty()
  @IsObject()
  appFeatures: {
    sendCustomerQuestionnaireRequest: boolean;
    dataSources: ApiDataSource[];
    canCustomizeExport: boolean;
    fullyCustomizableExpose: boolean;
    htmlSnippet: boolean;
  };
}

export default ApiSubscriptionPlanDto;

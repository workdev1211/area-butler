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
  IApiSubscriptionLimits,
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
  limits?: IApiSubscriptionLimits;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  description?: string[];

  @IsOptional()
  @IsString()
  vatStatus?: string;

  @IsOptional()
  @IsString()
  footnote?: string;

  @IsOptional()
  @IsString()
  purchaseButtonLabel?: string;
}

export default ApiSubscriptionPricingDto;

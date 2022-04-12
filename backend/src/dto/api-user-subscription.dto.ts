import {
  ApiSubscriptionPlanType,
  ApiUserSubscription
} from '@area-butler-types/subscription-plan';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import ApiSubscriptionPlanDto from './api-subscription-plan.dto';

class ApiUserSubscriptionDto implements ApiUserSubscription {

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSubscriptionPlanDto)
  config: ApiSubscriptionPlanDto;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  endsAt: Date;

  @IsNotEmpty()
  @IsDate()
  trialEndsAt: Date;

  @IsNotEmpty()
  @IsEnum(ApiSubscriptionPlanType)
  type: ApiSubscriptionPlanType;
}

export default ApiUserSubscriptionDto;

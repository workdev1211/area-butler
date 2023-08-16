import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSubscriptionPlanType,
  ApiUserSubscription,
  PaymentSystemTypeEnum,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionPlanDto from '../../dto/api-subscription-plan.dto';

class ApiUserSubscriptionDto implements ApiUserSubscription {
  @IsNotEmpty()
  @IsObject()
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
  @IsEnum(ApiSubscriptionPlanType)
  type: ApiSubscriptionPlanType;

  @IsNotEmpty()
  @IsEnum(PaymentSystemTypeEnum)
  paymentSystemType: PaymentSystemTypeEnum;

  @IsNotEmpty()
  @IsString()
  priceId: string;
}

export default ApiUserSubscriptionDto;

import {
  ApiSubscriptionPricing,
  IApiSubscriptionLimitIncreaseParams,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionPlanDto from '../../dto/api-subscription-plan.dto';
import ApiSubscriptionPricingDto from '../../dto/api-subscription-pricing.dto';

export interface ISubscriptionPlanPrice {
  plan: ApiSubscriptionPlanDto;
  price: ApiSubscriptionPricingDto;
}

// TODO think about using decorators or strategy patterns for different payment types
export enum PaymentItemTypeEnum {
  SubscriptionPrice = 'subscriptionPrice',
  LimitIncrease = 'limitIncrease',
}

export interface IPaymentItem {
  type: PaymentItemTypeEnum;
  item: ApiSubscriptionPricing | IApiSubscriptionLimitIncreaseParams;
}

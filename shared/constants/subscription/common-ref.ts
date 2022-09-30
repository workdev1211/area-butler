import {
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
} from "../../types/subscription-plan";
import { trialSubscription } from "./trial";
import {
  payPerUse10Subscription,
  payPerUse1Subscription,
  payPerUse5Subscription,
} from "./pay-per-use";
import {
  businessPlusSubscription,
  businessPlusV2Subscription,
} from "./business-plus";
import { getBidirectionalMapping } from "../../functions/shared.functions";

export const allSubscriptions: Record<
  ApiSubscriptionPlanType,
  ApiSubscriptionPlan
> = {
  [ApiSubscriptionPlanType.TRIAL]: trialSubscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_1]: payPerUse1Subscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_5]: payPerUse5Subscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_10]: payPerUse10Subscription,
  [ApiSubscriptionPlanType.BUSINESS_PLUS]: businessPlusSubscription,
  [ApiSubscriptionPlanType.BUSINESS_PLUS_V2]: businessPlusV2Subscription,
  // TODO will be released later
  // [ApiSubscriptionPlanType.ENTERPRISE]: enterpriseSubscription,
};

const stripeToPaypalPriceIdInnerMapping = new Map([
  // 1 address
  [payPerUse1Subscription.prices[0].id.dev, "P-5LG886410T224820FMLHHYAQ"],
  [payPerUse1Subscription.prices[0].id.prod, "P-4A545690LT0026012MLIBG4I"],
  // 5 addresses
  [payPerUse5Subscription.prices[0].id.dev, "P-4G735745B4688602UMLHHXTI"],
  [payPerUse5Subscription.prices[0].id.prod, "P-2PU61420N09695708MLIBHYI"],
  // 10 addresses
  [payPerUse10Subscription.prices[0].id.dev, "P-8K1945607B4163147MLHHYMQ"],
  [payPerUse10Subscription.prices[0].id.prod, "P-07K80946HM441550FMLIBIOI"],
  // Business+ Monthly
  [businessPlusV2Subscription.prices[0].id.dev, "P-38V72829JY6379617MLIBL2Y"],
  [businessPlusV2Subscription.prices[0].id.prod, "P-5N1640967J2210027MLIBFMY"],
  // Business+ Yearly
  [businessPlusV2Subscription.prices[1].id.dev, "P-4MF22929P7113410TMLHHZJY"],
  [businessPlusV2Subscription.prices[1].id.prod, "P-3RC37657WF249540KMLIBF7I"],
]);

export const stripeToPaypalPriceIdMapping = getBidirectionalMapping(
  stripeToPaypalPriceIdInnerMapping
);

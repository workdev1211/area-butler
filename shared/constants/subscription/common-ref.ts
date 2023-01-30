import {
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
} from "../../types/subscription-plan";
import { trialSubscription } from "./trial";
import {
  payPerUse10Subscription,
  payPerUse10SubscriptionLegacy,
  payPerUse1Subscription,
  payPerUse1SubscriptionLegacy,
} from "./pay-per-use";
import {
  businessPlusSubscription,
  businessPlusV2Subscription,
  businessPlusV2SubscriptionLegacy,
} from "./business-plus";
import { getBidirectionalMapping } from "../../functions/shared.functions";

export const allSubscriptions: Record<
  ApiSubscriptionPlanType,
  ApiSubscriptionPlan
> = {
  [ApiSubscriptionPlanType.TRIAL]: trialSubscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_1]: payPerUse1Subscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_10]: payPerUse10Subscription,
  [ApiSubscriptionPlanType.BUSINESS_PLUS]: businessPlusSubscription,
  [ApiSubscriptionPlanType.BUSINESS_PLUS_V2]: businessPlusV2Subscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_1_LEGACY]: payPerUse1SubscriptionLegacy,
  [ApiSubscriptionPlanType.PAY_PER_USE_10_LEGACY]:
    payPerUse10SubscriptionLegacy,
  [ApiSubscriptionPlanType.BUSINESS_PLUS_V2_LEGACY]:
    businessPlusV2SubscriptionLegacy,
  // TODO will be released later
  // [ApiSubscriptionPlanType.ENTERPRISE]: enterpriseSubscription,
};

const stripeToPaypalPriceIdInnerMapping = new Map([
  // 1 address
  [payPerUse1Subscription.prices[0].id.dev, "P-4SY93538NB5432744MPMAB2A"],
  [payPerUse1Subscription.prices[0].id.prod, "P-07C18850SF2981428MPNHUFA"],
  // 10 addresses
  [payPerUse10Subscription.prices[0].id.dev, "P-6CT26720BB720091RMPMAEGQ"],
  [payPerUse10Subscription.prices[0].id.prod, "P-1C697721KR692131HMPNHUYA"],
  // Business+ Monthly
  [businessPlusV2Subscription.prices[0].id.dev, "P-40441437EY851451HMPL77NI"],
  [businessPlusV2Subscription.prices[0].id.prod, "P-42Y48925334277112MPNHVHY"],
  // Business+ Yearly
  [businessPlusV2Subscription.prices[1].id.dev, "P-8VB40421A0313213GMPL776Y"],
  [businessPlusV2Subscription.prices[1].id.prod, "P-1CW71671P7487093KMPNHVTI"],
]);

export const stripeToPaypalPriceIdMapping = getBidirectionalMapping(
  stripeToPaypalPriceIdInnerMapping
);

import {
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionPlanType,
} from "../../types/subscription-plan";

export const allSubscriptionTypes: {
  type: ApiSubscriptionPlanType;
  name: string;
}[] = [
  { type: ApiSubscriptionPlanType.TRIAL, name: "Trial" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_1, name: "Pay per Use x1" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_5, name: "Pay per Use x5" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_10, name: "Pay per Use x10" },
  { type: ApiSubscriptionPlanType.BUSINESS_PLUS, name: "Business+" },
  { type: ApiSubscriptionPlanType.BUSINESS_PLUS_V2, name: "Business+" },
  // TODO will be released later
  // { type: ApiSubscriptionPlanType.ENTERPRISE, name: "Enterprise" },
];

// Number of requests (addresses) is set on monthly basis
export const cumulativeRequestSubscriptionTypes: ApiSubscriptionPlanType[] = [
  ApiSubscriptionPlanType.BUSINESS_PLUS,
  ApiSubscriptionPlanType.BUSINESS_PLUS_V2,
];

// Number of requests (addresses) is set for the entire period
export const fixedRequestSubscriptionTypes: ApiSubscriptionPlanType[] = [
  ApiSubscriptionPlanType.TRIAL,
  ApiSubscriptionPlanType.PAY_PER_USE_1,
  ApiSubscriptionPlanType.PAY_PER_USE_5,
  ApiSubscriptionPlanType.PAY_PER_USE_10,
];

export const subscriptionIntervals = {
  [ApiSubscriptionIntervalEnum.FOUR_DAYS]: { value: 4, unit: "days" },
  [ApiSubscriptionIntervalEnum.MONTHLY]: { value: 1, unit: "month" },
  [ApiSubscriptionIntervalEnum.ANNUALLY]: { value: 1, unit: "year" },
  [ApiSubscriptionIntervalEnum.TWELVE_WEEKS]: { value: 12, unit: "weeks" },
  [ApiSubscriptionIntervalEnum.QUARTERLY]: { value: 3, unit: "months" },
};

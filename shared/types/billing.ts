import { ApiSubscriptionPlanType } from "./subscription-plan";

export interface ApiCreateCheckout {
  priceId: string;
  amount?: number;
  // trialPeriod?: number;
  mode?: ApiStripeCheckoutModeEnum;
  metadata?: IApiCheckoutMetadata;
}

export enum ApiStripeCheckoutModeEnum {
  Subscription = "subscription",
  Payment = "payment",
}

export enum ApiStripeCheckoutPaymentStatusEnum {
  NoPaymentRequired = "no_payment_required",
  Paid = "paid",
  Unpaid = "unpaid",
}

export interface IApiCheckoutMetadata {
  [key: string]: string | number | null;
}

export interface ILimitIncreaseMetadata {
  modelName: LimitIncreaseModelNameEnum;
  modelId: string;
}

export enum LimitIncreaseModelNameEnum {
  LocationSearch = "LocationSearch",
  SearchResultSnapshot = "SearchResultSnapshot",
}

export type TApiStripeCheckoutMode = {
  [key in ApiSubscriptionPlanType]?: ApiStripeCheckoutModeEnum;
};

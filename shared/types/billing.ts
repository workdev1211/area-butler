export interface ApiCreateCheckout {
  priceId: string;
  amount?: number;
  trialPeriod?: number;
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
  [name: string]: string | number | null;
}

export enum LimitIncreaseModelNameEnum {
  LocationSearch = "LocationSearch",
  SearchResultSnapshot = "SearchResultSnapshot",
}

export interface ILimitIncreaseMetadata extends IApiCheckoutMetadata {
  modelName: LimitIncreaseModelNameEnum;
  modelId: string;
}

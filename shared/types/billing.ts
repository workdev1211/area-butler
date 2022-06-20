export interface ApiCreateCheckout {
  priceId: string;
  amount?: number;
  trialPeriod?: number;
  mode?: "subscription" | "payment";
  metadata?: IApiCheckoutMetadata;
}

export interface IApiCheckoutMetadata {
  [name: string]: string | number | null;
}

export interface ILimitIncreaseMetadata extends IApiCheckoutMetadata {
  modelName: string;
  modelId: string;
}
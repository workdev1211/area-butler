export enum ApiSubscriptionPlanType {
  TRIAL = "TRIAL",
  PAY_PER_USE_1 = "PAY_PER_USE_1",
  PAY_PER_USE_5 = "PAY_PER_USE_5",
  PAY_PER_USE_10 = "PAY_PER_USE_10",
  BUSINESS_PLUS = "BUSINESS_PLUS",
  BUSINESS_PLUS_V2 = "BUSINESS_PLUS_V2",
  // TODO will be released later
  // ENTERPRISE = "ENTERPRISE",
}

// used as a text description on the paywall (subscription plan selection page)
export enum ApiSubscriptionPlanTypeGroupEnum {
  PAY_PER_USE = "Pay per Use",
  BUSINESS_PLUS = "Business+",
}

export enum ApiSubscriptionIntervalEnum {
  FOUR_DAYS = "FOUR_DAYS",
  MONTHLY = "MONTHLY",
  ANNUALLY = "ANNUALLY",
  TWELVE_WEEKS = "TWELVE_WEEKS",
  QUARTERLY = "QUARTERLY",
}

// used as the object keys
export enum ApiSubscriptionLimitsEnum {
  NUMBER_OF_REQUESTS = "numberOfRequests",
  ADDRESS_EXPIRATION = "addressExpiration",
}

export enum ApiRequestContingentType {
  RECURRENT = "RECURRENT",
  INCREASE = "INCREASE",
}

export enum ApiDataSource {
  OSM = "OSM",
  CENSUS = "CENSUS",
  FEDERAL_ELECTION = "FEDERAL_ELECTION",
  PARTICLE_POLLUTION = "PARTICLE_POLLUTION",
}

export enum PaymentSystemTypeEnum {
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
}

export interface ApiUserSubscription {
  type: ApiSubscriptionPlanType;
  paymentSystemType: PaymentSystemTypeEnum;
  createdAt: Date;
  endsAt: Date;
  priceId: string;
  config: ApiSubscriptionPlan;
}

// TODO think about splitting into Stripe and PayPal
export interface IApiSubscriptionEnvIds {
  dev?: string;
  prod?: string;
}

export interface IApiSubscriptionLimitAmount {
  value: number;
  unit?: string;
}

// TODO think about making two "prices" - the value itself and its text representation
export interface IApiSubscriptionLimitIncreaseParams {
  id: IApiSubscriptionEnvIds;
  amount: IApiSubscriptionLimitAmount;
  name: string;
  type?: ApiSubscriptionLimitsEnum;
  price: string;
  description: string;
}

export interface IApiSubscriptionLimit {
  amount: IApiSubscriptionLimitAmount;
  increaseParams?: IApiSubscriptionLimitIncreaseParams[];
  name?: string;
  description?: string;
}

// Could be changed to the type later
export interface IApiSubscriptionLimits {
  [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]?: IApiSubscriptionLimit;
  [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]?: IApiSubscriptionLimit;
}

export interface ApiSubscriptionPricing {
  id: IApiSubscriptionEnvIds;
  name?: string;
  price: string;
  interval: IApiSubscriptionLimitAmount;
  limits?: IApiSubscriptionLimits;
  description?: string[];
  vatStatus?: string;
  footnote?: string;
  purchaseButtonLabel?: string;
}

export interface IApiSubscriptionPlanAppFeatures {
  sendCustomerQuestionnaireRequest: boolean;
  dataSources: ApiDataSource[];
  canCustomizeExport: boolean;
  fullyCustomizableExpose: boolean;
  htmlSnippet: boolean;
  openAi: boolean;
}

export interface ApiSubscriptionPlan {
  id?: IApiSubscriptionEnvIds;
  name: string;
  type: ApiSubscriptionPlanType;
  prices: ApiSubscriptionPricing[];
  limits?: IApiSubscriptionLimits;
  description?: string[];
  footnote?: string;
  purchaseButtonLabel?: string;
  appFeatures: IApiSubscriptionPlanAppFeatures;
}

export interface ApiRequestContingent {
  amount: number;
  type: ApiRequestContingentType;
  date: Date;
}

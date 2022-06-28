export interface ApiUserSubscription {
  type: ApiSubscriptionPlanType;
  createdAt: Date;
  endsAt: Date;
  trialEndsAt: Date;
  priceId: string;
  config: ApiSubscriptionPlan;
}

export enum ApiSubscriptionIntervalEnum {
  MONTHLY = "monthly",
  ANNUALLY = "annually",
  TWELVE_WEEKS = "twelveWeeks",
  QUARTERLY = "quarterly",
}

export interface IApiSubscriptionEnvIds {
  dev?: string;
  prod?: string;
}

export interface IApiSubscriptionLimitAmount {
  value: number;
  unit?: string;
}

export interface IApiSubscriptionLimitIncreaseParams {
  id: IApiSubscriptionEnvIds;
  amount: IApiSubscriptionLimitAmount;
  name: string;
  description: string;
}

export interface IApiSubscriptionLimit {
  amount: IApiSubscriptionLimitAmount;
  increaseParams?: IApiSubscriptionLimitIncreaseParams[];
  name?: string;
  description?: string;
}

export enum ApiSubscriptionLimitsEnum {
  NumberOfRequests = "numberOfRequests",
  AddressExpiration = "addressExpiration",
}

// Could be changed to the type later
export interface IApiSubscriptionLimits {
  [ApiSubscriptionLimitsEnum.NumberOfRequests]?: IApiSubscriptionLimit;
  [ApiSubscriptionLimitsEnum.AddressExpiration]?: IApiSubscriptionLimit;
}

export enum ApiSubscriptionPlanType {
  PAY_PER_USE_1 = "PAY_PER_USE_1",
  PAY_PER_USE_5 = "PAY_PER_USE_5",
  PAY_PER_USE_10 = "PAY_PER_USE_10",
  BUSINESS_PLUS = "BUSINESS_PLUS",
  BUSINESS_PLUS_V2 = "BUSINESS_PLUS_V2",
  // TODO will be released later
  // ENTERPRISE = "ENTERPRISE",
  // TODO should be removed after complete approval of the New Pricing Model
  TRIAL = "TRIAL",
}

export enum ApiSubscriptionPlanTypeGroupEnum {
  PayPerUse = "Pay per Use",
  BusinessPlus = "Business+",
}

export interface ApiSubscriptionPricing {
  id: IApiSubscriptionEnvIds;
  name?: string;
  price: string;
  interval: ApiSubscriptionIntervalEnum;
  limits?: IApiSubscriptionLimits;
  description?: string[];
  vatStatus?: string;
  footnote?: string;
  purchaseButtonLabel?: string;
}

export interface ApiSubscriptionPlan {
  name: string;
  type: ApiSubscriptionPlanType;
  prices: ApiSubscriptionPricing[];
  limits?: IApiSubscriptionLimits;
  description?: string[];
  footnote?: string;
  purchaseButtonLabel?: string;
  appFeatures: {
    sendCustomerQuestionnaireRequest: boolean;
    dataSources: ApiDataSource[];
    canCustomizeExport: boolean;
    fullyCustomizableExpose: boolean;
    htmlSnippet: boolean;
  };
}

export interface ApiRequestContingent {
  amount: number;
  type: ApiRequestContingentType;
  date: Date;
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

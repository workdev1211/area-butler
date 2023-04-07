import {
  ApiDataSource,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionPlanType,
} from "../../types/subscription-plan";
import { CsvFileFormatsEnum } from "../../types/types";
import {
  ApiStripeCheckoutModeEnum,
  TApiStripeCheckoutMode,
} from "../../types/billing";

export const allSubscriptionTypes: {
  type: ApiSubscriptionPlanType;
  name: string;
}[] = [
  { type: ApiSubscriptionPlanType.TRIAL, name: "Testphase" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_1, name: "Pay per Use x1" },
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
  ApiSubscriptionPlanType.PAY_PER_USE_10,
];

// TODO refactor this temporary hack
export const stripeSubscriptionsCheckoutMode: TApiStripeCheckoutMode = {
  [ApiSubscriptionPlanType.PAY_PER_USE_1]: ApiStripeCheckoutModeEnum.Payment,
  [ApiSubscriptionPlanType.PAY_PER_USE_10]: ApiStripeCheckoutModeEnum.Payment,
  [ApiSubscriptionPlanType.BUSINESS_PLUS_V2]:
    ApiStripeCheckoutModeEnum.Subscription,
};

export const subscriptionIntervals = {
  [ApiSubscriptionIntervalEnum.FOUR_DAYS]: { value: 4, unit: "days" },
  [ApiSubscriptionIntervalEnum.MONTHLY]: { value: 1, unit: "month" },
  [ApiSubscriptionIntervalEnum.ANNUALLY]: { value: 1, unit: "year" },
  [ApiSubscriptionIntervalEnum.TWELVE_WEEKS]: { value: 12, unit: "weeks" },
  [ApiSubscriptionIntervalEnum.QUARTERLY]: { value: 3, unit: "months" },
};

export const commonAppFeatures = {
  sendCustomerQuestionnaireRequest: true,
  dataSources: [
    ApiDataSource.OSM,
    ApiDataSource.CENSUS,
    ApiDataSource.FEDERAL_ELECTION,
    ApiDataSource.PARTICLE_POLLUTION,
    ApiDataSource.LOCATION_INDICES,
  ],
  canCustomizeExport: true,
  fullyCustomizableExpose: true,
  htmlSnippet: true,
  openAi: true,
  csvFileFormat: CsvFileFormatsEnum.AREA_BUTLER,
};

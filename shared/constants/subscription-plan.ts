import {
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
  ApiDataSource,
} from "../types/subscription-plan";

export const allSubscriptionTypes: {
  type: ApiSubscriptionPlanType;
  label: string;
}[] = [
  { type: ApiSubscriptionPlanType.STANDARD, label: "Standard" },
  { type: ApiSubscriptionPlanType.PRO, label: "Pro" },
];

export const standardSubscription: ApiSubscriptionPlan = {
  type: ApiSubscriptionPlanType.STANDARD,
  limits: {
    numberOfRealEstates: 500, // TODO proper limits
  },
  stripeId: "124", // TODO proper stripe id
  appFeatures: {
    sendCustomerQuestionnaireRequest: true, // TODO change
    dataSources: [ApiDataSource.OSM],
  },
};

export const proSubscription: ApiSubscriptionPlan = {
  type: ApiSubscriptionPlanType.PRO,
  limits: {
    numberOfRealEstates: 2000, // TODO proper limits
  },
  stripeId: "125", // TODO proper stripe id
  appFeatures: {
    sendCustomerQuestionnaireRequest: true,
    dataSources: [ApiDataSource.OSM, ApiDataSource.CENSUS],
  },
};

export const allSubscriptions: Record<
  ApiSubscriptionPlanType,
  ApiSubscriptionPlan
> = {
  [ApiSubscriptionPlanType.STANDARD]: standardSubscription,
  [ApiSubscriptionPlanType.PRO]: standardSubscription,
};

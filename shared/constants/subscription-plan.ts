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
    numberOfRealEstates: 5,
  },
  stripeId: "124",
  appFeatures: {
    sendCustomerRequest: false,
    dataSources: [ApiDataSource.OSM],
  },
};

export const proSubscription: ApiSubscriptionPlan = {
  type: ApiSubscriptionPlanType.PRO,
  limits: {
    numberOfRealEstates: 20,
  },
  stripeId: "125",
  appFeatures: {
    sendCustomerRequest: true,
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

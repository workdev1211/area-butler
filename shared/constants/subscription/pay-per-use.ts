import {
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
  IApiSubscriptionLimitIncreaseParams,
} from "../../types/subscription-plan";
import { commonAppFeatures, subscriptionIntervals } from "./common";

const payPerUseRequestLimitIncrease: IApiSubscriptionLimitIncreaseParams[] = [
  {
    id: {
      dev: "price_1MW5z7Lcbb2Q3qBpAXd3Qvqd",
      prod: "price_1LG07gLcbb2Q3qBpiHOGArxB",
    },
    amount: { value: 1 },
    name: "Abfrage Kontingent",
    price: "39",
    description:
      "Ihr aktuelles Adress-Kontingent ist aufgebraucht und lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 39,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan.",
  },
  {
    id: {
      dev: "price_1MW5yULcbb2Q3qBpWnScAUbF",
      prod: "price_1MWhmrLcbb2Q3qBpqTSgxFbk",
    },
    amount: { value: 10 },
    name: "Abfrage Kontingent",
    price: "290",
    description:
      "Ihr aktuelles Adress-Kontingent ist aufgebraucht und lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 29,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan.",
  },
];

const payPerUseAddressDurationIncrease: IApiSubscriptionLimitIncreaseParams[] =
  [
    {
      id: {
        dev: "price_1MW5zvLcbb2Q3qBp2XFXoKuI",
        prod: "price_1LG09ZLcbb2Q3qBp6BObksux",
      },
      amount: { value: 6, unit: "months" },
      name: "Adressablauf Kontingent",
      price: "10",
      description:
        "Ihre aktuelle Online-Hosting-Zeit ist aufgebraucht und erlaubt es nicht mit iFrames / Snippets zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 5,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan.",
    },
  ];

export const payPerUse1Subscription: ApiSubscriptionPlan = {
  name: "Eine Adresse",
  type: ApiSubscriptionPlanType.PAY_PER_USE_1,
  prices: [
    {
      id: {
        dev: "price_1MW1XxLcbb2Q3qBpSidJOGs7",
        prod: "price_1MWhuyLcbb2Q3qBpeC6hVZjQ",
      },
      name: "Eine Adresse",
      price: "39",
      purchaseButtonLabel: "Einzelabfrage kaufen",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 1 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]: {
          amount: { value: 6, unit: "months" },
          increaseParams: payPerUseAddressDurationIncrease,
        },
      },
    },
  ],
  appFeatures: commonAppFeatures,
};

export const payPerUse1SubscriptionLegacy = JSON.parse(
  JSON.stringify(payPerUse1Subscription)
);
payPerUse1SubscriptionLegacy.prices[0].id = {
  dev: "price_1LAUOVLcbb2Q3qBpRhqjaCb5",
  prod: "price_1LFzpKLcbb2Q3qBpuRsjhPNa",
};

export const payPerUse10Subscription: ApiSubscriptionPlan = {
  name: "10er Karte",
  type: ApiSubscriptionPlanType.PAY_PER_USE_10,
  prices: [
    {
      id: {
        dev: "price_1MW1ZBLcbb2Q3qBp13JFrMxe",
        prod: "price_1MWhvgLcbb2Q3qBpBz6vJ8eh",
      },
      name: "10er Karte",
      price: "29",
      purchaseButtonLabel: "10er Karte kaufen",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 10 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]: {
          amount: { value: 6, unit: "months" },
          increaseParams: payPerUseAddressDurationIncrease,
        },
      },
    },
  ],
  appFeatures: commonAppFeatures,
};

// A legacy one, applied only to 633414f62b84bfee88fa3e6e and 634667debb7ddab1eff8d518
export const payPerUse5SubscriptionLegacy: ApiSubscriptionPlan = {
  name: "5er Karte",
  type: ApiSubscriptionPlanType.PAY_PER_USE_5_LEGACY,
  prices: [
    {
      id: {
        dev: "price_1LFzpPLcbb2Q3qBpNDijoJqd",
        prod: "price_1LFzpPLcbb2Q3qBpNDijoJqd",
      },
      name: "5er Karte",
      price: "190",
      purchaseButtonLabel: "5er Karte kaufen",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 5 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]: {
          amount: { value: 12, unit: "months" },
          increaseParams: payPerUseAddressDurationIncrease,
        },
      },
    },
  ],
  appFeatures: commonAppFeatures,
};

export const payPerUse10SubscriptionLegacy = JSON.parse(
  JSON.stringify(payPerUse10Subscription)
);
payPerUse10SubscriptionLegacy.prices[0].id = {
  dev: "price_1LAUPsLcbb2Q3qBpmM72R6DK",
  prod: "price_1LFzpULcbb2Q3qBplTPeFi36",
};

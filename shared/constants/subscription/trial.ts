import {
  ApiDataSource,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
} from "../../types/subscription-plan";
import { commonAppFeatures, subscriptionIntervals } from "./common";
import { CsvFileFormatEnum } from "../../types/types";

export const TRIAL_DAYS = 4;
export const TRIAL_PRICE_ID = "trial";

export const trialSubscription: ApiSubscriptionPlan = {
  name: "Trial",
  type: ApiSubscriptionPlanType.TRIAL,
  prices: [
    {
      id: {
        dev: TRIAL_PRICE_ID,
        prod: TRIAL_PRICE_ID,
      },
      name: "Trial",
      price: "0",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.FOUR_DAYS],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 4 },
        },
      },
      description: [
        "100 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
      ],
    },
  ],
  description: [
    'Alle "Pay per Use" Funktionen',
    "iFrames online gehostet für Ihren gesamten Abonnementzeitraum",
    "1 individuell designter Kartenstil inklusive",
    "Automatisches verschicken von Kriterienabfragen an Kundinnen",
    "Individuelles Onboarding Ihres Teams",
    "24/7 individueller Service",
  ],
  appFeatures: commonAppFeatures,
};

import {
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
} from "../../types/subscription-plan";
import { commonAppFeatures, subscriptionIntervals } from "../subscription-plan";

// Legacy Business+ subscription
export const businessPlusSubscription: ApiSubscriptionPlan = {
  name: "Business+",
  type: ApiSubscriptionPlanType.BUSINESS_PLUS,
  prices: [
    {
      id: {
        dev: "price_1JpHc4Lcbb2Q3qBpam7MLdw7",
        prod: "price_1Jw8g2Lcbb2Q3qBp72CuwKjT",
      },
      name: "Per 500",
      price: "250",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.MONTHLY],
    },
    {
      id: {
        dev: "price_1JrlRBLcbb2Q3qBpoLgnzxCC",
        prod: "price_1Jw8g2Lcbb2Q3qBpX7r3BGMl",
      },
      name: "Per 500",
      price: "2750",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
    },
  ],
  limits: {
    [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
      amount: { value: 500 },
      increaseParams: [
        {
          id: {
            dev: "price_1JpejDLcbb2Q3qBpNFh2rph9",
            prod: "price_1Jw8ftLcbb2Q3qBp73Out78u",
          },
          amount: { value: 100 },
          name: "Abfrage Kontingent",
          price: "30",
          description:
            "Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 30,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan",
        },
      ],
    },
  },
  description: [
    "bis zu 500 Umgebungsanalysen im Monat",
    "Beliebig viele Interessenten & Objekte hinterlegen",
    "vollautomatisiertes Exposé",
    "Analyse basierend auf allen Geo-Daten",
    "Versand von Fragebögen",
  ],
  appFeatures: commonAppFeatures,
};

// Actual Business+ subscription
export const businessPlusV2Subscription: ApiSubscriptionPlan = {
  name: "Business+",
  type: ApiSubscriptionPlanType.BUSINESS_PLUS_V2,
  prices: [
    {
      id: {
        dev: "price_1MW1bPLcbb2Q3qBpwZJVXw5b",
        prod: "price_1MWhxHLcbb2Q3qBpO9twWYv1",
      },
      name: "Business+ Monats-Abo",
      price: "390",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.MONTHLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 50 },
          increaseParams: [
            {
              id: {
                dev: "price_1MW613Lcbb2Q3qBpAegCVnJx",
                prod: "price_1MWhpULcbb2Q3qBphacweHAe",
              },
              amount: { value: 50 },
              name: "Abfrage Kontingent",
              price: "390",
              description:
                "Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 390,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan",
            },
          ],
        },
      },
      description: [
        "50 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
      ],
    },
    {
      id: {
        dev: "price_1MW1cXLcbb2Q3qBpaPXpWmNF",
        prod: "price_1MWhxHLcbb2Q3qBpjR0VyIcY",
      },
      name: "Business+ Jahres-Abo",
      price: "3.900",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 50 },
          increaseParams: [
            {
              id: {
                dev: "price_1MW61ULcbb2Q3qBpp9qVvExV",
                prod: "price_1MWht9Lcbb2Q3qBpbddmWNqG",
              },
              amount: { value: 50 },
              name: "Abfrage Kontingent",
              price: "325",
              description:
                "Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 325,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan",
            },
          ],
        },
      },
      description: [
        "50 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
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

export const businessPlusV2SubscriptionLegacy = JSON.parse(
  JSON.stringify(businessPlusV2Subscription)
);
businessPlusV2SubscriptionLegacy.prices[0].id = {
  dev: "price_1LG01pLcbb2Q3qBp75uFSyCx",
  prod: "price_1LFznwLcbb2Q3qBp3acGp9ni",
};
businessPlusV2SubscriptionLegacy.prices[1].id = {
  dev: "price_1LG1QDLcbb2Q3qBpuSArUSwU",
  prod: "price_1LFznwLcbb2Q3qBpgxksSRhO",
};

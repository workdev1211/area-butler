import {
  ApiDataSource,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
  IApiSubscriptionLimitIncreaseParams,
} from "../../types/subscription-plan";
import { subscriptionIntervals } from "./common";
import { CsvFileFormatEnum } from "../../types/types";

const appFeatures = {
  sendCustomerQuestionnaireRequest: false,
  dataSources: [
    ApiDataSource.OSM,
    ApiDataSource.CENSUS,
    ApiDataSource.FEDERAL_ELECTION,
    ApiDataSource.PARTICLE_POLLUTION,
  ],
  canCustomizeExport: true,
  fullyCustomizableExpose: true,
  htmlSnippet: true,
  openAi: false,
  csvFileFormat: CsvFileFormatEnum.AREA_BUTLER,
};

const payPerUseRequestLimitIncrease: IApiSubscriptionLimitIncreaseParams[] = [
  {
    id: {
      dev: "price_1LCHlOLcbb2Q3qBpZltd36hh",
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
      dev: "price_1LCHm5Lcbb2Q3qBp0CRFBhib",
      prod: "price_1LG08DLcbb2Q3qBp2j4YrmLi",
    },
    amount: { value: 5 },
    name: "Abfrage Kontingent",
    price: "156",
    description:
      "Ihr aktuelles Adress-Kontingent ist aufgebraucht und lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 156,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan.",
  },
  {
    id: {
      dev: "price_1LCHmyLcbb2Q3qBpM8txQGt1",
      prod: "price_1LG08gLcbb2Q3qBp6vHlkpHP",
    },
    amount: { value: 10 },
    name: "Abfrage Kontingent",
    price: "232",
    description:
      "Ihr aktuelles Adress-Kontingent ist aufgebraucht und lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 232,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan.",
  },
];

const payPerUsePlanDescription = [
  "Interaktive Karten als iFrame",
  "Umfeldanalyse & Überblick als pdf & word",
  "Hochauflösende Kartenausschnitte als .png",
  "Sie können Ihre Farben, Logos und Icons integrieren",
  "E-Mail-Support & FAQ",
  "Daten: OSM, Zensus, Wahlergebnisse, Luftqualität",
  "Optional: Individuell designter Kartenstil",
  "Optional: KI-Lagetextgenerator für Ihre Exposés",
];

export const payPerUse1Subscription: ApiSubscriptionPlan = {
  name: "Einzelabfrage",
  type: ApiSubscriptionPlanType.PAY_PER_USE_1,
  prices: [
    {
      id: {
        dev: "price_1LAUOVLcbb2Q3qBpRhqjaCb5",
        prod: "price_1LFzpKLcbb2Q3qBpuRsjhPNa",
      },
      name: "Einzelabfrage",
      price: "49",
      vatStatus: "zzgl. MwSt",
      footnote:
        '<strong>*</strong> 58,31€ total inkl. MwSt. Die gekauften Einzelabfragen haben eine Gültigkeit von 12 Monaten und müssen in dieser Zeit verbraucht werden. Nicht verbrauchte Adressen verfallen. Die iFrames/Widgets aus den "Pay per Use" Plänen werden für 12 Wochen, nach Veröffentlichung durch den User im AreaButler Karten-Editor, online gehosted. Eine Verlängerung dieses Zeitraums ist für 12 € inkl. MwSt optional möglich.',
      purchaseButtonLabel: "Elnzelabfrage kaufen",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 1 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]: {
          amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: {
                dev: "price_1LCHoxLcbb2Q3qBpZfdy2LRM",
                prod: "price_1LG09ZLcbb2Q3qBp6BObksux",
              },
              amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              price: "10",
              description:
                "Ihre aktuelle Online-Hosting-Zeit ist aufgebraucht und erlaubt es nicht mit iFrames / Snippets zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 10,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan.",
            },
          ],
        },
      },
      description: [
        "Eine Adresse in Deutschland analysieren, aufbereiten & präsentieren",
      ],
    },
  ],
  description: payPerUsePlanDescription,
  appFeatures,
};

export const payPerUse5Subscription: ApiSubscriptionPlan = {
  name: "5er Karte",
  type: ApiSubscriptionPlanType.PAY_PER_USE_5,
  prices: [
    {
      id: {
        dev: "price_1LCIZwLcbb2Q3qBpYMEmHHTO",
        prod: "price_1LFzpPLcbb2Q3qBpNDijoJqd",
      },
      name: "5er Karte",
      price: "190",
      vatStatus: "zzgl. MwSt",
      footnote:
        '<strong>*</strong> 226,1€ total inkl. MwSt. Die gekauften Einzelabfragen haben eine Gültigkeit von 12 Monaten und müssen in dieser Zeit verbraucht werden. Nicht verbrauchte Adressen verfallen. Die iFrames/Widgets aus den "Pay per Use" Plänen werden für 12 Wochen, nach Veröffentlichung durch den User im AreaButler Karten-Editor, online gehosted. Eine Verlängerung dieses Zeitraums ist für 10 € inkl. MwSt optional möglich.',
      purchaseButtonLabel: "5er Karte kaufen",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 5 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]: {
          amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: {
                dev: "price_1LCHpWLcbb2Q3qBpfiSiJ1RY",
                prod: "price_1LG0AFLcbb2Q3qBp0pf6joUm",
              },
              amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              price: "8",
              description:
                "Ihre aktuelle Online-Hosting-Zeit ist aufgebraucht und erlaubt es nicht mit iFrames / Snippets zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 8,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan.",
            },
          ],
        },
      },
      description: [
        "5 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
      ],
    },
  ],
  description: payPerUsePlanDescription,
  appFeatures,
};

export const payPerUse10Subscription: ApiSubscriptionPlan = {
  name: "10er Karte",
  type: ApiSubscriptionPlanType.PAY_PER_USE_10,
  prices: [
    {
      id: {
        dev: "price_1LAUPsLcbb2Q3qBpmM72R6DK",
        prod: "price_1LFzpULcbb2Q3qBplTPeFi36",
      },
      name: "10er Karte",
      price: "290",
      vatStatus: "zzgl. MwSt",
      footnote:
        '<strong>*</strong> 345,1€ total inkl. MwSt. Die gekauften Einzelabfragen haben eine Gültigkeit von 12 Monaten und müssen in dieser Zeit verbraucht werden. Nicht verbrauchte Adressen verfallen. Die iFrames/Widgets aus den "Pay per Use" Plänen werden für 12 Wochen, nach Veröffentlichung durch den User im AreaButler Karten-Editor, online gehosted. Eine Verlängerung dieses Zeitraums ist für 6 € inkl. MwSt optional möglich.',
      purchaseButtonLabel: "10er Karte kaufen",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
          amount: { value: 10 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION]: {
          amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: {
                dev: "price_1LG0DdLcbb2Q3qBpkZ9XNmhq",
                prod: "price_1LG0AdLcbb2Q3qBpWdpzdoQ1",
              },
              amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              price: "5",
              description:
                "Ihre aktuelle Online-Hosting-Zeit ist aufgebraucht und erlaubt es nicht mit iFrames / Snippets zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 5,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan.",
            },
          ],
        },
      },
      description: [
        "10 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
      ],
    },
  ],
  description: payPerUsePlanDescription,
  appFeatures,
};

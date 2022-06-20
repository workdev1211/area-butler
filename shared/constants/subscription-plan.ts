import {
  ApiDataSource,
  ApiSubscriptionPlan,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionPlanType,
  ApiSubscriptionLimitsEnum,
  IApiSubscriptionLimitIncreaseParams,
} from "../types/subscription-plan";

export const TRIAL_DAYS = 4;

export const allSubscriptionTypes: {
  type: ApiSubscriptionPlanType;
  name: string;
}[] = [
  { type: ApiSubscriptionPlanType.PAY_PER_USE_1, name: "Pay per Use (1)" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_5, name: "Pay per Use (5)" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_10, name: "Pay per Use (10)" },
  { type: ApiSubscriptionPlanType.BUSINESS_PLUS, name: "Business+" },
  { type: ApiSubscriptionPlanType.BUSINESS_PLUS_V2, name: "Business+" },
  { type: ApiSubscriptionPlanType.TRIAL, name: "Trial" },
  // TODO will be released later
  // { type: ApiSubscriptionPlanType.ENTERPRISE, name: "Enterprise" },
];

// Number of requests (addresses) is set for each month
export const cumulativeRequestSubscriptionTypes: ApiSubscriptionPlanType[] = [
  ApiSubscriptionPlanType.BUSINESS_PLUS,
  ApiSubscriptionPlanType.BUSINESS_PLUS_V2,
];

// Number of requests (addresses) is set for the entire period
export const fixedRequestSubscriptionTypes: ApiSubscriptionPlanType[] = [
  ApiSubscriptionPlanType.PAY_PER_USE_1,
  ApiSubscriptionPlanType.PAY_PER_USE_5,
  ApiSubscriptionPlanType.PAY_PER_USE_10,
  ApiSubscriptionPlanType.TRIAL,
];

const payPerUseRequestLimitIncrease: IApiSubscriptionLimitIncreaseParams[] = [
  {
    id: { dev: "price_1LCHlOLcbb2Q3qBpZltd36hh" },
    amount: { value: 1 },
    name: "Abfrage Kontingent",
    description:
      "Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 39,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan",
  },
  {
    id: { dev: "price_1LCHm5Lcbb2Q3qBp0CRFBhib" },
    amount: { value: 5 },
    name: "Abfrage Kontingent",
    description:
      "Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 156,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan",
  },
  {
    id: { dev: "price_1LCHmyLcbb2Q3qBpM8txQGt1" },
    amount: { value: 10 },
    name: "Abfrage Kontingent",
    description:
      "Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 232,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan",
  },
];

export const payPerUse1Subscription: ApiSubscriptionPlan = {
  name: "Pay per Use x1",
  type: ApiSubscriptionPlanType.PAY_PER_USE_1,
  prices: [
    {
      id: { dev: "price_1LAUOVLcbb2Q3qBpRhqjaCb5" },
      name: "Per 1",
      price: "49",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 1 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
          amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: { dev: "price_1LCHoTLcbb2Q3qBp9jt47xMN" },
              amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              description:
                "Ihr aktuelles Adressablauf kontingent erlaubt es nicht mit iFrames / Karten zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 13,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan",
            },
          ],
        },
      },
    },
  ],
  description: [
    "pro Adresse",
    "iFrame / Widget mit Ihren Farben & Logos",
    "PDF & Word Exporte mit Ihren Farben & Logos",
    "Hochauflösende Kartenausschnitte",
    "Fragebögen an Ihre Kunden verschicken",
    "Karten & POI Daten",
    "Sozio-Ökonomische Analyse-Daten",
    "Email Support und FAQs",
  ],
  appFeatures: {
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
  },
};

export const payPerUse5Subscription: ApiSubscriptionPlan = {
  name: "Pay per Use x5",
  type: ApiSubscriptionPlanType.PAY_PER_USE_5,
  prices: [
    {
      id: { dev: "price_1LCIZwLcbb2Q3qBpYMEmHHTO" },
      name: "Per 5",
      price: "190",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 5 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
          amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: { dev: "price_1LCHoTLcbb2Q3qBp9jt47xMN" },
              amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              description:
                "Ihr aktuelles Adressablauf kontingent erlaubt es nicht mit iFrames / Karten zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 10,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan",
            },
          ],
        },
      },
    },
  ],
  description: [
    "pro Adresse",
    "iFrame / Widget mit Ihren Farben & Logos",
    "PDF & Word Exporte mit Ihren Farben & Logos",
    "Hochauflösende Kartenausschnitte",
    "Fragebögen an Ihre Kunden verschicken",
    "Karten & POI Daten",
    "Sozio-Ökonomische Analyse-Daten",
    "Email Support und FAQs",
  ],
  appFeatures: {
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
  },
};

export const payPerUse10Subscription: ApiSubscriptionPlan = {
  name: "Pay per Use x10",
  type: ApiSubscriptionPlanType.PAY_PER_USE_10,
  prices: [
    {
      id: { dev: "price_1LAUPsLcbb2Q3qBpmM72R6DK" },
      name: "Per 10",
      price: "290",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 10 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
          amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: { dev: "price_1LCHoTLcbb2Q3qBp9jt47xMN" },
              amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              description:
                "Ihr aktuelles Adressablauf kontingent erlaubt es nicht mit iFrames / Karten zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 8,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan",
            },
          ],
        },
      },
    },
  ],
  description: [
    "pro Adresse",
    "iFrame / Widget mit Ihren Farben & Logos",
    "PDF & Word Exporte mit Ihren Farben & Logos",
    "Hochauflösende Kartenausschnitte",
    "Fragebögen an Ihre Kunden verschicken",
    "Karten & POI Daten",
    "Sozio-Ökonomische Analyse-Daten",
    "Email Support und FAQs",
  ],
  appFeatures: {
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
  },
};

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
      interval: ApiSubscriptionIntervalEnum.MONTHLY,
    },
    {
      id: {
        dev: "price_1JrlRBLcbb2Q3qBpoLgnzxCC",
        prod: "price_1Jw8g2Lcbb2Q3qBpX7r3BGMl",
      },
      name: "Per 500",
      price: "2750",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
    },
  ],
  limits: {
    [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
      amount: { value: 500 },
      increaseParams: [
        {
          id: {
            dev: "price_1JpejDLcbb2Q3qBpNFh2rph9",
            prod: "price_1Jw8ftLcbb2Q3qBp73Out78u",
          },
          amount: { value: 100 },
          name: "Abfrage Kontingent",
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
  appFeatures: {
    sendCustomerQuestionnaireRequest: true,
    dataSources: [
      ApiDataSource.OSM,
      ApiDataSource.CENSUS,
      ApiDataSource.FEDERAL_ELECTION,
      ApiDataSource.PARTICLE_POLLUTION,
    ],
    canCustomizeExport: true,
    fullyCustomizableExpose: true,
    htmlSnippet: true,
  },
};

const businessPlusRequestLimitIncrease: IApiSubscriptionLimitIncreaseParams[] =
  [
    {
      id: { dev: "price_1LCHqFLcbb2Q3qBpmxFBI6TE" },
      amount: { value: 50 },
      name: "Abfrage Kontingent",
      description:
        "Ihr Aktuelles Abfrage Kontingent lässt keine weiteren Abfragen zu. Bitte kaufen Sie ein weiteres Kontingent für 125,00 € (zzgl. MwSt.) oder wechseln Sie auf einen höheren Plan",
    },
  ];

// Actual Business+ subscription
export const businessPlusV2Subscription: ApiSubscriptionPlan = {
  name: "Business+",
  type: ApiSubscriptionPlanType.BUSINESS_PLUS_V2,
  prices: [
    {
      id: { dev: "price_1LCIdULcbb2Q3qBpprbknZcZ" },
      name: "Per 100",
      price: "1770",
      interval: ApiSubscriptionIntervalEnum.QUARTERLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 100 },
          increaseParams: businessPlusRequestLimitIncrease,
        },
      },
      description: ["100 Adressen pro Monat"],
    },
    {
      id: { dev: "price_1LCIdULcbb2Q3qBp42UdqzxG" },
      name: "Per 200",
      price: "6490",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 200 },
          increaseParams: businessPlusRequestLimitIncrease,
        },
      },
      description: ["200 Adressen pro Monat"],
    },
  ],
  description: [
    'Alle Funktionen aus "Pay per use"',
    "+ Karten Stile in eigenem Design",
    "+ individuelles onboarding",
    "+ 24*7 persönlicher Kundenservice",
  ],
  appFeatures: {
    sendCustomerQuestionnaireRequest: true,
    dataSources: [
      ApiDataSource.OSM,
      ApiDataSource.CENSUS,
      ApiDataSource.FEDERAL_ELECTION,
      ApiDataSource.PARTICLE_POLLUTION,
    ],
    canCustomizeExport: true,
    fullyCustomizableExpose: true,
    htmlSnippet: true,
  },
};

export const trialSubscription: ApiSubscriptionPlan = {
  ...businessPlusV2Subscription,
  type: ApiSubscriptionPlanType.TRIAL,
  limits: {
    [ApiSubscriptionLimitsEnum.NumberOfRequests]: { amount: { value: 1 } },
  },
};

export const allSubscriptions: Record<
  ApiSubscriptionPlanType,
  ApiSubscriptionPlan
> = {
  [ApiSubscriptionPlanType.PAY_PER_USE_1]: payPerUse1Subscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_5]: payPerUse5Subscription,
  [ApiSubscriptionPlanType.PAY_PER_USE_10]: payPerUse10Subscription,
  [ApiSubscriptionPlanType.BUSINESS_PLUS]: businessPlusSubscription,
  [ApiSubscriptionPlanType.BUSINESS_PLUS_V2]: businessPlusV2Subscription,
  // TODO will be released later
  // [ApiSubscriptionPlanType.ENTERPRISE]: enterpriseSubscription,
  [ApiSubscriptionPlanType.TRIAL]: trialSubscription,
};

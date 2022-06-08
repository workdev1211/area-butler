import {
  ApiDataSource,
  ApiSubscriptionPlan,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionPlanType,
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

// Number of requests (addresses) is summed up from the values set for each month
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

export const payPerUse1Subscription: ApiSubscriptionPlan = {
  name: "Pay per Use",
  type: ApiSubscriptionPlanType.PAY_PER_USE_1,
  prices: [
    {
      id: { dev: "price_1LAUOVLcbb2Q3qBpRhqjaCb5" },
      name: "Per 1",
      price: "49",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: { numberOfRequests: { amount: 1 } },
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
  name: "Pay per Use",
  type: ApiSubscriptionPlanType.PAY_PER_USE_5,
  prices: [
    {
      id: { dev: "price_1LAUPELcbb2Q3qBpne9Hyox6" },
      name: "Per 5",
      price: "195",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: { numberOfRequests: { amount: 5 } },
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
  name: "Pay per Use",
  type: ApiSubscriptionPlanType.PAY_PER_USE_10,
  prices: [
    {
      id: { dev: "price_1LAUPsLcbb2Q3qBpmM72R6DK" },
      name: "Per 10",
      price: "290",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: { numberOfRequests: { amount: 10 } },
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
    numberOfRequests: {
      amount: 500,
      increaseParams: {
        id: {
          dev: "price_1JpejDLcbb2Q3qBpNFh2rph9",
          prod: "price_1Jw8ftLcbb2Q3qBp73Out78u",
        },
        amount: 100,
      },
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

// Actual Business+ subscription
export const businessPlusV2Subscription: ApiSubscriptionPlan = {
  name: "Business+",
  type: ApiSubscriptionPlanType.BUSINESS_PLUS_V2,
  prices: [
    {
      id: { dev: "price_1LApwWLcbb2Q3qBpgGgTVGbV" },
      name: "Per 100",
      price: "1470",
      interval: ApiSubscriptionIntervalEnum.QUARTERLY,
      limits: { numberOfRequests: { amount: 100 } },
      description: ["100 Adressen pro Monat"],
    },
    {
      id: { dev: "price_1L8Lx8Lcbb2Q3qBpPX9JNiId" },
      name: "Per 200",
      price: "5390",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: { numberOfRequests: { amount: 200 } },
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

// TODO will be released later
// export const enterpriseSubscription: ApiSubscriptionPlan = {
//   name: "Enterprise",
//   type: ApiSubscriptionPlanType.ENTERPRISE,
//   limits: null,
//   prices: [
//     {
//       id: {
//         dev: "",
//         prod: "",
//       },
//       price: "",
//       interval: ApiSubscriptionPlanInterval.MONTHLY,
//     },
//     {
//       id: {
//         dev: "",
//         prod: "",
//       },
//       price: "",
//       interval: ApiSubscriptionPlanInterval.ANNUALLY,
//     },
//   ],
//   requestIncreaseId: {
//     dev: "",
//     prod: "",
//   },
//   properties: [
//     "Beliebig viele Adressen",
//     'Alle Funktionen von "Business+"',
//     "+ voll individualisierbare Exporte",
//     "+ individuelle Integration in Ihre Website",
//     "+ individuelle api Integration in Ihr CMS/CRM",
//   ],
//   appFeatures: {
//     requestIncreasePackage: null,
//     sendCustomerQuestionnaireRequest: true,
//     dataSources: Object.values(ApiDataSource),
//     canCustomizeExport: true,
//     fullyCustomizableExpose: true,
//     htmlSnippet: true,
//   },
// };

// TODO npmdl ask Alex
export const trialSubscription: ApiSubscriptionPlan = {
  ...businessPlusV2Subscription,
  type: ApiSubscriptionPlanType.TRIAL,
  limits: {
    numberOfRequests: { amount: 1 },
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

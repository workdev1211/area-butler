import {
  ApiDataSource,
  ApiSubscriptionPlan,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionPlanType,
  ApiSubscriptionLimitsEnum,
  IApiSubscriptionLimitIncreaseParams,
} from "../types/subscription-plan";

export const TRIAL_DAYS = 2;

export const allSubscriptionTypes: {
  type: ApiSubscriptionPlanType;
  name: string;
}[] = [
  { type: ApiSubscriptionPlanType.PAY_PER_USE_1, name: "Pay per Use x1" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_5, name: "Pay per Use x5" },
  { type: ApiSubscriptionPlanType.PAY_PER_USE_10, name: "Pay per Use x10" },
  { type: ApiSubscriptionPlanType.BUSINESS_PLUS, name: "Business+" },
  { type: ApiSubscriptionPlanType.BUSINESS_PLUS_V2, name: "Business+" },
  // TODO should be removed after complete approval of the New Pricing Model
  // { type: ApiSubscriptionPlanType.TRIAL, name: "Trial" },
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
  // TODO should be removed after complete approval of the New Pricing Model
  // ApiSubscriptionPlanType.TRIAL,
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
      id: { dev: "price_1LAUOVLcbb2Q3qBpRhqjaCb5" },
      name: "Einzelabfrage",
      price: "49<sup>*</sup>",
      vatStatus: "zzgl. MwSt",
      footnote:
        '<strong>*</strong> 58,31€ total inkl. MwSt. Die gekauften Einzelabfragen haben eine Gültigkeit von 12 Monaten und müssen in dieser Zeit verbraucht werden. Nicht verbrauchte Adressen verfallen. Die iFrames/Widgets aus den "Pay per Use" Plänen werden für 12 Wochen, nach Veröffentlichung durch den User im AreaButler Karten-Editor, online gehosted. Eine Verlängerung dieses Zeitraums ist für 12 € inkl. MwSt optional möglich.',
      purchaseButtonLabel: "Elnzelabfrage kaufen",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 1 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
          amount: { value: 12, unit: "minutes" },
          // amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: { dev: "price_1LCHoTLcbb2Q3qBp9jt47xMN" },
              amount: { value: 4, unit: "minutes" },
              // amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              description:
                "Ihr aktuelles Adressablauf kontingent erlaubt es nicht mit iFrames / Karten zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 13,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan",
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
  name: "5er Karte",
  type: ApiSubscriptionPlanType.PAY_PER_USE_5,
  prices: [
    {
      id: { dev: "price_1LCIZwLcbb2Q3qBpYMEmHHTO" },
      name: "5er Karte",
      price: "190<sup>*</sup>",
      vatStatus: "zzgl. MwSt",
      footnote:
        '<strong>*</strong> 226,1€ total inkl. MwSt. Die gekauften Einzelabfragen haben eine Gültigkeit von 12 Monaten und müssen in dieser Zeit verbraucht werden. Nicht verbrauchte Adressen verfallen. Die iFrames/Widgets aus den "Pay per Use" Plänen werden für 12 Wochen, nach Veröffentlichung durch den User im AreaButler Karten-Editor, online gehosted. Eine Verlängerung dieses Zeitraums ist für 10 € inkl. MwSt optional möglich.',
      purchaseButtonLabel: "5er Karte kaufen",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 5 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
          amount: { value: 12, unit: "minutes" },
          // amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: { dev: "price_1LCHoxLcbb2Q3qBpZfdy2LRM" },
              amount: { value: 4, unit: "minutes" },
              // amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              description:
                "Ihr aktuelles Adressablauf kontingent erlaubt es nicht mit iFrames / Karten zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 10,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan",
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
  name: "10er Karte",
  type: ApiSubscriptionPlanType.PAY_PER_USE_10,
  prices: [
    {
      id: { dev: "price_1LAUPsLcbb2Q3qBpmM72R6DK" },
      name: "10er Karte",
      price: "290<sup>*</sup>",
      vatStatus: "zzgl. MwSt",
      footnote:
        '<strong>*</strong> 345,1€ total inkl. MwSt. Die gekauften Einzelabfragen haben eine Gültigkeit von 12 Monaten und müssen in dieser Zeit verbraucht werden. Nicht verbrauchte Adressen verfallen. Die iFrames/Widgets aus den "Pay per Use" Plänen werden für 12 Wochen, nach Veröffentlichung durch den User im AreaButler Karten-Editor, online gehosted. Eine Verlängerung dieses Zeitraums ist für 6 € inkl. MwSt optional möglich.',
      purchaseButtonLabel: "10er Karte kaufen",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 10 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
          amount: { value: 12, unit: "minutes" },
          // amount: { value: 12, unit: "weeks" },
          increaseParams: [
            {
              id: { dev: "price_1LCHpWLcbb2Q3qBpfiSiJ1RY" },
              amount: { value: 4, unit: "minutes" },
              // amount: { value: 4, unit: "weeks" },
              name: "Adressablauf Kontingent",
              description:
                "Ihr aktuelles Adressablauf kontingent erlaubt es nicht mit iFrames / Karten zu arbeiten. Bitte erwerben Sie ein weiteres Kontingent für 8,00 € (zzgl. MwSt.) oder upgraden Sie auf einen höheren Plan",
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
      name: "Business+ Monats-Abo",
      price: "590<sup>*</sup>",
      vatStatus: "Monat zzgl. MwSt",
      footnote:
        "<strong>*</strong> 702,1€ total inkl. MwSt. Wird der Vertrag nicht innerhalb von 2 Tagen nach Vertragsschluss gekündigt, geht er in ein reguläres kostenpflichtiges Abonnement mit dem gewählten Abonnement-Zeitraum von einem Monat/einem Jahr über. Nach Ende des aktuellen Abonnement-Zeitraums verlängert sich die Laufzeit des Vertrags automatisch um einen weiteren Monat/ein weiteres Jahr, wenn der Nutzer den Vertrag nicht bis zum Ende des aktuellen Abonnement-Zeitraums durch Erklärung in Textform gegenüber KuDiBa kündigt.",
      interval: ApiSubscriptionIntervalEnum.QUARTERLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 100 },
          increaseParams: businessPlusRequestLimitIncrease,
        },
      },
      description: [
        "150 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
      ],
    },
    {
      id: { dev: "price_1LCIdULcbb2Q3qBp42UdqzxG" },
      name: "Business+ Jahres-Abo",
      price: "6490<sup>*</sup>",
      vatStatus: "Jahr zzgl. MwSt",
      footnote:
        "<strong>*</strong> 7723,1€ total inkl. MwSt. Wird der Vertrag nicht innerhalb von 2 Tagen nach Kauf gekündigt, geht er in ein reguläres kostenpflichtiges Abonnement mit dem gewählten Abonnement-Zeitraum von einem Monat/einem Jahr über. Nach Ende des aktuellen Abonnement-Zeitraums verlängert sich die Laufzeit des Vertrags automatisch um einen weiteren Monat/ein weiteres Jahr, wenn der Nutzer den Vertrag nicht bis zum Ende des aktuellen Abonnement-Zeitraums durch Erklärung in Textform gegenüber KuDiBa kündigt.",
      interval: ApiSubscriptionIntervalEnum.ANNUALLY,
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 200 },
          increaseParams: businessPlusRequestLimitIncrease,
        },
      },
      description: [
        "250 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
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

// TODO should be removed after complete approval of the New Pricing Model
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
  // TODO should be removed after complete approval of the New Pricing Model
  [ApiSubscriptionPlanType.TRIAL]: trialSubscription,
};

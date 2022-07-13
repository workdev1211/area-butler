import {
  ApiDataSource,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
  IApiSubscriptionLimitIncreaseParams,
} from "../types/subscription-plan";
import { getBidirectionalMapping } from "../functions/shared.functions";

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
  ApiSubscriptionPlanType.PAY_PER_USE_1,
  ApiSubscriptionPlanType.PAY_PER_USE_5,
  ApiSubscriptionPlanType.PAY_PER_USE_10,
];

const subscriptionIntervals = {
  [ApiSubscriptionIntervalEnum.Monthly]: { value: 1, unit: "month" },
  [ApiSubscriptionIntervalEnum.Annually]: { value: 1, unit: "year" },
  [ApiSubscriptionIntervalEnum.TwelveWeeks]: { value: 12, unit: "weeks" },
  [ApiSubscriptionIntervalEnum.Quarterly]: { value: 3, unit: "months" },
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
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.Annually],
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 1 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
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
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.Annually],
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 5 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
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
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.Annually],
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 10 },
          increaseParams: payPerUseRequestLimitIncrease,
        },
        [ApiSubscriptionLimitsEnum.AddressExpiration]: {
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
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.Monthly],
    },
    {
      id: {
        dev: "price_1JrlRBLcbb2Q3qBpoLgnzxCC",
        prod: "price_1Jw8g2Lcbb2Q3qBpX7r3BGMl",
      },
      name: "Per 500",
      price: "2750",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.Annually],
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
      id: {
        dev: "price_1LCHqFLcbb2Q3qBpmxFBI6TE",
        prod: "price_1LG0EVLcbb2Q3qBpKUn7uEFu",
      },
      amount: { value: 50 },
      name: "Abfrage Kontingent",
      price: "125",
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
      id: {
        dev: "price_1LG01pLcbb2Q3qBp75uFSyCx",
        prod: "price_1LFznwLcbb2Q3qBp3acGp9ni",
      },
      name: "Business+ Monats-Abo",
      price: "590",
      vatStatus: "Monat zzgl. MwSt",
      footnote:
        "<strong>*</strong> 702,1€ total inkl. MwSt. Wird der Vertrag nicht innerhalb von 2 Tagen nach Vertragsschluss gekündigt, geht er in ein reguläres kostenpflichtiges Abonnement mit dem gewählten Abonnement-Zeitraum von einem Monat über. Nach Ende des aktuellen Abonnement-Zeitraums verlängert sich die Laufzeit des Vertrags automatisch um einen weiteren Monat, wenn der Nutzer den Vertrag nicht bis zum Ende des aktuellen Abonnement-Zeitraums durch Erklärung in Textform gegenüber KuDiBa kündigt. Die initiale Mindestvertragslaufzeit beträgt 3 Monate, danach monatlich kündbar.",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.Monthly],
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 100 },
          increaseParams: businessPlusRequestLimitIncrease,
        },
      },
      description: [
        "100 Adressen in Deutschland analysieren, aufbereiten & präsentieren",
      ],
    },
    {
      id: {
        dev: "price_1LG1QDLcbb2Q3qBpuSArUSwU",
        prod: "price_1LFznwLcbb2Q3qBpgxksSRhO",
      },
      name: "Business+ Jahres-Abo",
      price: "6.490",
      vatStatus: "Jahr zzgl. MwSt",
      footnote:
        "<strong>*</strong> 7723,1€ total inkl. MwSt. Wird der Vertrag nicht innerhalb von 2 Tagen nach Kauf gekündigt, geht er in ein reguläres kostenpflichtiges Abonnement mit dem gewählten Abonnement-Zeitraum von einem Jahr über. Nach Ende des aktuellen Abonnement-Zeitraums verlängert sich die Laufzeit des Vertrags automatisch um ein weiteres Jahr, wenn der Nutzer den Vertrag nicht bis zum Ende des aktuellen Abonnement-Zeitraums durch Erklärung in Textform gegenüber KuDiBa kündigt.",
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.Annually],
      limits: {
        [ApiSubscriptionLimitsEnum.NumberOfRequests]: {
          amount: { value: 250 },
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
};

const stripeToPaypalPriceIdInnerMapping = new Map([
  [payPerUse1Subscription.prices[0].id.dev, "P-17K48145Y7328734UMLFO4RY"],
  [payPerUse5Subscription.prices[0].id.dev, "P-7YD09266W3894572UMLFO2UY"],
  [payPerUse10Subscription.prices[0].id.dev, "P-34474291VV339831KMLFO5CA"],
  [businessPlusV2Subscription.prices[0].id.dev, "P-45809131KX012483RMLCGSTI"], // monthly
  [businessPlusV2Subscription.prices[1].id.dev, "P-68T51639N10206632MLCGTCI"], // yearly
]);

export const stripeToPaypalPriceIdMapping = getBidirectionalMapping(
  stripeToPaypalPriceIdInnerMapping
);

export const paypalWithWoTrialPriceIdMapping = new Map([
  ["P-17K48145Y7328734UMLFO4RY", "P-5LG886410T224820FMLHHYAQ"],
  ["P-7YD09266W3894572UMLFO2UY", "P-4G735745B4688602UMLHHXTI"],
  ["P-34474291VV339831KMLFO5CA", "P-8K1945607B4163147MLHHYMQ"],
  ["P-45809131KX012483RMLCGSTI", "P-2PG60537FY898243FMLHHYYI"], // monthly
  ["P-68T51639N10206632MLCGTCI", "P-4MF22929P7113410TMLHHZJY"], // yearly
]);

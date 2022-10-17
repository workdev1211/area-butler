import {
  ApiDataSource,
  ApiSubscriptionIntervalEnum,
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
  IApiSubscriptionLimitIncreaseParams,
} from "../../types/subscription-plan";
import { subscriptionIntervals } from "../subscription-plan";
import { CsvFileFormatEnum } from "../../types/types";

export const appFeatures = {
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
  openAi: false,
  csvFileFormat: CsvFileFormatEnum.AREA_BUTLER,
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
  appFeatures,
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
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.MONTHLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
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
      interval: subscriptionIntervals[ApiSubscriptionIntervalEnum.ANNUALLY],
      limits: {
        [ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS]: {
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
  appFeatures,
};

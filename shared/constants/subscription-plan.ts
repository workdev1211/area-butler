import {ApiDataSource, ApiSubscriptionPlan, ApiSubscriptionPlanType,} from "../types/subscription-plan";

export const TRIAL_DAYS = 14;

export const allSubscriptionTypes: {
    type: ApiSubscriptionPlanType;
    label: string;
}[] = [
    {type: ApiSubscriptionPlanType.STANDARD, label: "Standard"},
    {type: ApiSubscriptionPlanType.PRO, label: "Pro"},
    {type: ApiSubscriptionPlanType.BUSINESS_PLUS, label: "Business+"},
];

export const standardSubscription: ApiSubscriptionPlan = {
    type: ApiSubscriptionPlanType.STANDARD,
    limits: {
        numberOfRequestsPerMonth: 20
    },
    priceIds: {
        dev: {
            requestIncreaseId: 'price_1JpeazLcbb2Q3qBpgUYRLUaW',
            monthlyId: 'price_1Jp7oWLcbb2Q3qBpK0DbKHfR',
            annuallyId: 'price_1JrlPQLcbb2Q3qBpJQF5JTaF'
        },
        prod: {
            requestIncreaseId: 'price_1Jw8ftLcbb2Q3qBpESLlpZ4v',
            monthlyId: 'price_1Jw8gALcbb2Q3qBp20TjytRI',
            annuallyId: 'price_1Jw8gALcbb2Q3qBpKDAnhGnX'
        }
    },
    properties: [
        'bis zu 20 Umgebungsanalysen im Monat',
        'Beliebig viele Interessenten & Objekten hinterlegen',
        'vollautomatisiertes Exposé',
        'Analyse basierend auf OSM-Daten',
    ],
    appFeatures: {
        requestIncreasePackage: 12,
        sendCustomerQuestionnaireRequest: false,
        dataSources: [ApiDataSource.OSM],
        canCustomizeExport: false
    },
};

export const proSubscription: ApiSubscriptionPlan = {
    type: ApiSubscriptionPlanType.PRO,
    limits: {
        numberOfRequestsPerMonth: 100
    },
    priceIds: {
        dev: {
            requestIncreaseId: 'price_1JpeivLcbb2Q3qBpnKL4gaMh',
            monthlyId: 'price_1JpHb4Lcbb2Q3qBpECFvTJJ1',
            annuallyId: 'price_1JrlQeLcbb2Q3qBpdXq9M5sW'
        },
        prod: {
            requestIncreaseId: 'price_1Jw8ftLcbb2Q3qBpGXldv0vo',
            monthlyId: 'price_1Jw8g6Lcbb2Q3qBp6GfMGdkC',
            annuallyId: 'price_1Jw8g6Lcbb2Q3qBpJ8VSzPvZ'
        },
    },
    properties: [
        'bis zu 100 Umgebungsanalysen im Monat',
        'Beliebig viele Interessenten & Objekten hinterlegen',
        'vollautomatisiertes Exposé',
        'Analyse basierend auf OSM- und Zensus-Daten',
        'Versand von Fragebögen'
    ],
    appFeatures: {
        requestIncreasePackage: 50,
        sendCustomerQuestionnaireRequest: true,
        dataSources: [ApiDataSource.OSM, ApiDataSource.CENSUS],
        canCustomizeExport: true
    },
};

export const businessPlusSubscription: ApiSubscriptionPlan = {
    type: ApiSubscriptionPlanType.BUSINESS_PLUS,
    limits: {
        numberOfRequestsPerMonth: 500
    },
    priceIds: {
        dev: {
            requestIncreaseId: 'price_1JpejDLcbb2Q3qBpNFh2rph9',
            monthlyId: 'price_1JpHc4Lcbb2Q3qBpam7MLdw7',
            annuallyId: 'price_1JrlRBLcbb2Q3qBpoLgnzxCC'
        },
        prod: {
            requestIncreaseId: 'price_1Jw8ftLcbb2Q3qBp73Out78u',
            monthlyId: 'price_1Jw8g2Lcbb2Q3qBp72CuwKjT',
            annuallyId: 'price_1Jw8g2Lcbb2Q3qBpX7r3BGMl'
        }
    },
    properties: [
        'bis zu 500 Umgebungsanalysen im Monat',
        'Beliebig viele Interessenten & Objekte hinterlegen',
        'vollautomatisiertes Exposé',
        'Analyse basierend auf allen Geo-Daten',
        'Versand von Fragebögen',
    ],
    appFeatures: {
        requestIncreasePackage: 100,
        sendCustomerQuestionnaireRequest: true,
        dataSources: [ApiDataSource.OSM, ApiDataSource.CENSUS, ApiDataSource.FEDERAL_ELECTION, ApiDataSource.PARTICLE_POLLUTION],
        canCustomizeExport: true
    },
};

export const allSubscriptions: Record<ApiSubscriptionPlanType,
    ApiSubscriptionPlan> = {
    [ApiSubscriptionPlanType.STANDARD]: standardSubscription,
    [ApiSubscriptionPlanType.PRO]: proSubscription,
    [ApiSubscriptionPlanType.BUSINESS_PLUS]: businessPlusSubscription,
};

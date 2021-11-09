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
        numberOfRealEstates: 5,
        numberOfCustomers: 5,
        numberOfRequestsPerMonth: 20
    },
    priceIds: {
        dev: {
            requestIncreaseId: 'price_1JpeazLcbb2Q3qBpgUYRLUaW',
            monthlyId: 'price_1Jp7oWLcbb2Q3qBpK0DbKHfR',
            annuallyId: 'price_1JrlPQLcbb2Q3qBpJQF5JTaF'
        },
        prod: {
            requestIncreaseId: 'price_1JpeazLcbb2Q3qBpgUYRLUaW',
            monthlyId: 'price_1Jp7oWLcbb2Q3qBpK0DbKHfR',
            annuallyId: 'price_1JrlPQLcbb2Q3qBpJQF5JTaF'
        }
    },
    properties: [
        'bis zu 20 Umgebungsanalysen im Monat',
        'Daten von bis zu 5 Interessenten & Objekten hinterlegen',
        'vollautomatisiertes Exposé',
        'Analyse basierend auf OSM-Daten',
    ],
    appFeatures: {
        requestIncreasePackage: 12,
        sendCustomerQuestionnaireRequest: false,
        dataSources: [ApiDataSource.OSM],
    },
};

export const proSubscription: ApiSubscriptionPlan = {
    type: ApiSubscriptionPlanType.PRO,
    limits: {
        numberOfRealEstates: 20,
        numberOfCustomers: 20,
        numberOfRequestsPerMonth: 100
    },
    priceIds: {
        dev: {
            requestIncreaseId: 'price_1JpeivLcbb2Q3qBpnKL4gaMh',
            monthlyId: 'price_1JpHb4Lcbb2Q3qBpECFvTJJ1',
            annuallyId: 'price_1JrlQeLcbb2Q3qBpdXq9M5sW'
        },
        prod: {
            requestIncreaseId: 'price_1JpeivLcbb2Q3qBpnKL4gaMh',
            monthlyId: 'price_1JpHb4Lcbb2Q3qBpECFvTJJ1',
            annuallyId: 'price_1JrlQeLcbb2Q3qBpdXq9M5sW'
        },
    },
    properties: [
        'bis zu 100 Umgebungsanalysen im Monat',
        'Daten von bis zu 20 Interessenten & Objekten hinterlegen',
        'vollautomatisiertes Exposé',
        'Analyse basierend auf OSM- und Zensus-Daten',
        'Versand von Fragebögen'
    ],
    appFeatures: {
        requestIncreasePackage: 50,
        sendCustomerQuestionnaireRequest: true,
        dataSources: [ApiDataSource.OSM, ApiDataSource.CENSUS],
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
            requestIncreaseId: 'price_1JpejDLcbb2Q3qBpNFh2rph9',
            monthlyId: 'price_1JpHc4Lcbb2Q3qBpam7MLdw7',
            annuallyId: 'price_1JrlRBLcbb2Q3qBpoLgnzxCC'
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
        dataSources: [ApiDataSource.OSM, ApiDataSource.CENSUS, ApiDataSource.FEDERAL_ELECTION],
    },
};

export const allSubscriptions: Record<ApiSubscriptionPlanType,
    ApiSubscriptionPlan> = {
    [ApiSubscriptionPlanType.STANDARD]: standardSubscription,
    [ApiSubscriptionPlanType.PRO]: proSubscription,
    [ApiSubscriptionPlanType.BUSINESS_PLUS]: businessPlusSubscription,
};

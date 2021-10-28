import {ApiDataSource, ApiSubscriptionPlan, ApiSubscriptionPlanType,} from "../types/subscription-plan";

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
        numberOfRequestsPerMonth: 20
    },
    priceIds: {
        dev: {
            requestIncreaseId: 'price_1JpIK4Lcbb2Q3qBpNUuopdLE',
            monthlyId: 'price_1Jp7oWLcbb2Q3qBpK0DbKHfR',
            annuallyId: 'price_1Jp7oWLcbb2Q3qBp7Zr0tdAg'
        },
        prod: {
            requestIncreaseId: 'price_1JpIK4Lcbb2Q3qBpNUuopdLE',
            monthlyId: 'price_1Jp7oWLcbb2Q3qBpK0DbKHfR',
            annuallyId: 'price_1Jp7oWLcbb2Q3qBp7Zr0tdAg'
        }
    },
    properties: [
        'bis zu 20 Umgebungsanalysen im Monat',
        'Daten von bis zu 5 Interessenten & Objekten hinterlegen',
        'vollautomatisiertes Exposé',
        'Analyse basierend auf OSM-Daten',
    ],
    appFeatures: {
        sendCustomerQuestionnaireRequest: false,
        dataSources: [ApiDataSource.OSM],
    },
};

export const proSubscription: ApiSubscriptionPlan = {
    type: ApiSubscriptionPlanType.PRO,
    limits: {
        numberOfRealEstates: 20,
        numberOfRequestsPerMonth: 100
    },
    priceIds: {
        dev: {
            requestIncreaseId: 'price_1JpIK4Lcbb2Q3qBpNUuopdLE',
            monthlyId: 'price_1JpHb4Lcbb2Q3qBpECFvTJJ1',
            annuallyId: 'price_1JpHb4Lcbb2Q3qBpMdpyAKwQ'
        },
        prod: {
            requestIncreaseId: 'price_1JpIK4Lcbb2Q3qBpNUuopdLE',
            monthlyId: 'price_1JpHb4Lcbb2Q3qBpECFvTJJ1',
            annuallyId: 'price_1JpHb4Lcbb2Q3qBpMdpyAKwQ'
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
            requestIncreaseId: 'price_1JpIK4Lcbb2Q3qBpNUuopdLE',
            monthlyId: 'price_1JpHc4Lcbb2Q3qBpam7MLdw7',
            annuallyId: 'price_1JpHc4Lcbb2Q3qBpKlNJC5mP'
        },
        prod: {
            requestIncreaseId: 'price_1JpIK4Lcbb2Q3qBpNUuopdLE',
            monthlyId: 'price_1JpHc4Lcbb2Q3qBpam7MLdw7',
            annuallyId: 'price_1JpHc4Lcbb2Q3qBpKlNJC5mP'
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
        sendCustomerQuestionnaireRequest: true,
        dataSources: [ApiDataSource.OSM, ApiDataSource.CENSUS],
    },
};

export const allSubscriptions: Record<ApiSubscriptionPlanType,
    ApiSubscriptionPlan> = {
    [ApiSubscriptionPlanType.STANDARD]: standardSubscription,
    [ApiSubscriptionPlanType.PRO]: proSubscription,
    [ApiSubscriptionPlanType.BUSINESS_PLUS]: businessPlusSubscription,
};

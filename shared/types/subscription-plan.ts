export interface ApiUserSubscription {
    type: ApiSubscriptionPlanType;
    createdAt: Date;
    endsAt: Date;
    trialEndsAt: Date;
}

export enum ApiSubscriptionPlanType {
    STANDARD = 'STANDARD',
    PRO = 'PRO',
    BUSINESS_PLUS = 'BUSINESS_PLUS'
    // ENTERPRISE = 'ENTERPRISE' TODO coming soon
}

export interface ApiSubscriptionPricing {
    requestIncreaseId?: string,
    monthlyId?: string,
    annuallyId?: string
}

export interface ApiSubscriptionPlan {
    type: ApiSubscriptionPlanType,
    priceIds: {
        dev: ApiSubscriptionPricing,
        prod: ApiSubscriptionPricing
    },
    properties: string[],
    limits: {
        numberOfRealEstates?: number,
        numberOfRequestsPerMonth?: number,
    },
    appFeatures: {
        sendCustomerQuestionnaireRequest: boolean,
        dataSources: ApiDataSource[]
    }
}

export interface ApiRequestContingent {
    amount: number;
    type: ApiRequestContingentType;
    date: Date
}

export enum ApiRequestContingentType {
    RECURRENT = 'RECURRENT',
    INCREASE = 'INCREASE',
}

export enum ApiDataSource {
    OSM = 'OSM',
    CENSUS = 'CENSUS'
}

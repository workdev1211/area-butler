export interface ApiUserSubscription {
    type: ApiSubscriptionPlanType;
    createdAt: Date;
    endsAt: Date;
    trialEndsAt: Date;
    config: ApiSubscriptionPlan;
}

export enum ApiSubscriptionPlanType {
    STANDARD = 'STANDARD',
    PRO = 'PRO',
    BUSINESS_PLUS = 'BUSINESS_PLUS',
    TRIAL = 'TRIAL',
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
        numberOfRequestsPerMonth?: number,
    },
    appFeatures: {
        requestIncreasePackage: number;
        sendCustomerQuestionnaireRequest: boolean,
        dataSources: ApiDataSource[],
        canCustomizeExport: boolean,
        fullyCustomizableExpose: boolean
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
    CENSUS = 'CENSUS',
    FEDERAL_ELECTION = 'FEDERAL_ELECTION',
    PARTICLE_POLLUTION = 'PARTICLE_POLLUTION',
}

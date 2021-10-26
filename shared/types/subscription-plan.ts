export enum ApiSubscriptionPlanType {
    STANDARD = 'STANDARD',
    PRO = 'PRO',
    BUSINESS_PLUS = 'BUSINESS_PLUS'
    // ENTERPRISE = 'ENTERPRISE' TODO coming soon
}

export interface ApiSubscriptionPlan {
    type: ApiSubscriptionPlanType,
    stripeId: string,
    limits: {
        monthlyRequestContingent: ApiRequestContingent,
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
    date?: Date
}

export enum ApiRequestContingentType {
    RECURRENT = 'RECURRENT',
    INCREASE = 'INCREASE',
}


export enum ApiDataSource {
    OSM = 'OSM',
    CENSUS = 'CENSUS'
}
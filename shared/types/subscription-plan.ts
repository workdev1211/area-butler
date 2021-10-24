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
        numberOfRealEstates?: number,
        numberOfRequestsPerMonth?: number,
    },
    appFeatures: {
        sendCustomerQuestionnaireRequest: boolean,
        dataSources: ApiDataSource[]
    }
}


export enum ApiDataSource {
    OSM = 'OSM',
    CENSUS = 'CENSUS'
}
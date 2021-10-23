export enum ApiSubscriptionPlanType {
    STANDARD = 'STANDARD',
    PRO = 'PRO',
    // BUSINESS_PLUS = 'BUSINESS_PLUS', TODO coming soon
    // ENTERPRISE = 'ENTERPRISE' TODO coming soon
}

export interface ApiSubscriptionPlan {
    type: ApiSubscriptionPlanType,
    stripeId: string,
    limits: {
        numberOfRealEstates?: number,
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
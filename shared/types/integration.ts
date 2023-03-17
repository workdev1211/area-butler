export enum IntegrationTypesEnum {
  "ON_OFFICE" = "ON_OFFICE",
}

export interface IApiIntegrationParams {
  integrationId: string;
  integrationUserId: string;
  integrationType: IntegrationTypesEnum;
}

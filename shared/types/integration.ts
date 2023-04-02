import { TOnOfficeIntActTypes } from "./on-office";

export enum IntegrationTypesEnum {
  "ON_OFFICE" = "ON_OFFICE",
}

export interface IApiIntegrationParams {
  integrationId?: string;
  integrationUserId: string;
  integrationType: IntegrationTypesEnum;
}

export interface IApiRealEstateIntegrationParams extends IApiIntegrationParams {
  integrationId: string;
}

export type TIntegrationActionTypes = TOnOfficeIntActTypes;

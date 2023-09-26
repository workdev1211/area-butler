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
  openAiRequestQuantity?: number;
  iframeEndsAt?: Date;
  isOnePageExportActive?: boolean;
  isStatsFullExportActive?: boolean;
}

export type TIntegrationActionTypes = TOnOfficeIntActTypes;

export interface IApiUnlockIntProductReq {
  integrationId: string;
  actionType: TOnOfficeIntActTypes;
}

export type TUnlockIntProduct = (
  modalMessage?: string,
  actionType?: TOnOfficeIntActTypes
) => void;

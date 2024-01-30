import { TOnOfficeIntActTypes } from "./on-office";
import { ISelectTextValue, RequestStatusTypesEnum } from "./types";

export enum IntegrationTypesEnum {
  ON_OFFICE = "ON_OFFICE",
  PROPSTACK = "PROPSTACK",
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

export interface IIntegrationHandleLogin {
  requestStatus: RequestStatusTypesEnum;
  message?: string;
}

export interface IApiSyncEstatesIntFilterParams {
  estateStatus?: string;
  estateMarketType?: string;
}

export interface IApiRealEstAvailIntStatuses {
  estateStatuses?: ISelectTextValue[];
  estateMarketTypes?: ISelectTextValue[];
}

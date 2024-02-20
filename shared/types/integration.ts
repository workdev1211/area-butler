import { TOnOfficeIntActTypes } from "./on-office";
import { ISelectTextValue, RequestStatusTypesEnum } from "./types";
import { AreaButlerExportTypesEnum } from "./integration-user";
import { OpenAiQueryTypeEnum } from "./open-ai";

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

export interface IApiIntUpdEstTextFieldReq {
  exportType:
    | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
    | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION
    | AreaButlerExportTypesEnum.INLINE_FRAME
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS;
  integrationId: string;
  text: string;
}

export interface IApiIntUploadEstateFileReq {
  exportType:
    | AreaButlerExportTypesEnum.QR_CODE
    | AreaButlerExportTypesEnum.SCREENSHOT
    | AreaButlerExportTypesEnum.ONE_PAGE_PNG;
  base64Content: string;
  fileTitle: string;
  integrationId: string;
  filename?: string;
}

export interface IApiIntCreateEstateLinkReq {
  exportType:
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS;
  integrationId: string;
  title: string;
  url: string;
}

export type TSendToIntegrationData = {
  isFileLink?: boolean;
  integrationId?: string;
} & (
  | Omit<IApiIntUpdEstTextFieldReq, "integrationId">
  | Omit<IApiIntUploadEstateFileReq, "integrationId">
  | Omit<IApiIntCreateEstateLinkReq, "integrationId">
);

import { IApiIntUpdEstTextFieldReq } from "./integration";
import { OpenAiQueryTypeEnum } from "./open-ai";
import { AreaButlerExportTypesEnum } from "./integration-user";

export interface IApiPropstackLoginReq {
  propertyId: number;
  shopId: number;
  brokerId: number;
  teamId?: number;
  textFieldType?: PropstackTextFieldTypeEnum;
}

export interface IApiPropstackTargetGroupChangedReq
  extends IApiPropstackLoginReq {
  targetGroupName: string;
}

export interface IApiPropstackLoginQueryParams {
  apiKey: string;
  propertyId: string;
  shopId: string;
  brokerId: string;
  teamId?: string;
  textFieldType?: PropstackTextFieldTypeEnum;
}

export enum PropstackPropMarketTypesEnum {
  BUY = "BUY",
  RENT = "RENT",
}

export interface IUploadPropertyImageRes {
  ok: boolean;
  id: number;
}

export interface IApiPropstackUpdEstTextFieldReq
  extends IApiIntUpdEstTextFieldReq {
  exportType:
    | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
    | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS;
}

export enum PropstackTextFieldTypeEnum {
  LOCATION_NOTE = "location_note",
  DESCRIPTION_NOTE = "description_note",
  OTHER_NOTE = "other_note",
}

export enum PropstackProductTypeEnum {
  OPEN_AI = "OPEN_AI",
  OPEN_AI_10 = "OPEN_AI_10",
  STATS_EXPORT = "STATS_EXPORT",
  STATS_EXPORT_10 = "STATS_EXPORT_10",
  FLAT_RATE = "FLAT_RATE",
}

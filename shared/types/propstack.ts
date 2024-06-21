import { IApiIntUpdEstTextFieldReq } from "./integration";
import { OpenAiQueryTypeEnum } from "./open-ai";
import { AreaButlerExportTypesEnum } from "./integration-user";

export interface IApiPropstackLoginQueryParams {
  apiKey: string;
  propertyId: string;
  shopId: string;
  brokerId: string;
  teamId?: string;
  target?: PropstackActionTypeEnum;
  fieldName?: PropstackFieldNameEnum;
}

export interface IApiPropstackLoginReq {
  propertyId: number;
  shopId: number;
  brokerId: number;
  teamId?: number;
  target?: PropstackActionTypeEnum;
  fieldName?: PropstackTextFieldTypeEnum;
}

export interface IApiPropstackTargetGroupChangedReq
  extends IApiPropstackLoginReq {
  targetGroupName: string;
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
    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION;
}

export enum PropstackActionTypeEnum {
  GENERATE_TEXT = "generateText",
}

export enum PropstackFieldNameEnum {
  LOCATION_NOTE = "location",
  DESCRIPTION_NOTE = "description",
  OTHER_NOTE = "other",
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
  SUBSCRIPTION = "SUBSCRIPTION",
}

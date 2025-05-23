import { IApiIntUpdEstTextFieldReq } from "./integration";
import { TOpenAiLocDescType } from "./open-ai";

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
  exportType: TOpenAiLocDescType;
}

export enum PropstackActionTypeEnum {
  GENERATE_TEXT = "generateText",
}

export enum PropstackFieldNameEnum {
  LOCATION_NOTE = "location",
  DESCRIPTION_NOTE = "description",
  FURNISHING_NOTE = "furnishing",
  OTHER_NOTE = "other",
}

export enum PropstackTextFieldTypeEnum {
  LOCATION_NOTE = "location_note",
  DESCRIPTION_NOTE = "description_note",
  OTHER_NOTE = "other_note",
  FURNISHING_NOTE = "furnishing_note",
}

export enum PropstackProductTypeEnum {
  OPEN_AI = "OPEN_AI",
  OPEN_AI_10 = "OPEN_AI_10",
  STATS_EXPORT = "STATS_EXPORT",
  STATS_EXPORT_10 = "STATS_EXPORT_10",
  SUBSCRIPTION = "SUBSCRIPTION",
}

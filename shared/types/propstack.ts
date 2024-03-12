import { IApiIntUpdEstTextFieldReq } from "./integration";
import { OpenAiQueryTypeEnum } from "./open-ai";
import { AreaButlerExportTypesEnum } from "./integration-user";

// TODO 'teamId' and 'brokerId' should be mandatory parameters
export interface IApiPropstackLoginReq {
  propertyId: number;
  shopId: number;
  teamId?: number;
  brokerId?: number;
  targetGroup?: string;
  textFieldType?: PropstackTextFieldTypeEnum;
}

// TODO 'teamId' and 'brokerId' should be mandatory parameters
export interface IApiPropstackLoginQueryParams {
  apiKey: string;
  propertyId: string;
  shopId: string;
  teamId?: string;
  brokerId?: string;
  targetGroup?: string;
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

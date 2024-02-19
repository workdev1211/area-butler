import { IApiIntUplEstFileReq } from "./integration";

export interface IApiPropstackLoginReq {
  propertyId: number;
  shopId: number;
  teamId?: number;
}

export interface IApiPropstackLoginQueryParams {
  apiKey: string;
  propertyId: string;
  shopId: string;
  teamId: string;
}

export enum PropstackPropMarketTypesEnum {
  BUY = "BUY",
  RENT = "RENT",
}

export interface IApiPropstackUplPropImgReq
  extends Omit<IApiIntUplEstFileReq, "filename"> {
  base64Content: string;
}

export interface IUploadPropertyImageRes {
  ok: boolean;
  id: number;
}

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

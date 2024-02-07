export interface IApiPropstackLoginReq {
  propertyId: number;
}

export interface IApiPropstackLoginQueryParams {
  apiKey: string;
  propertyId: string;
}

export enum PropstackPropMarketTypesEnum {
  BUY = "BUY",
  RENT = "RENT",
}

export interface IApiPropstackLoginReq {
  realEstateId: number;
}

export interface IApiPropstackLoginQueryParams {
  apiKey: string;
  propertyId: string;
}

export enum PropstackRealEstMarketTypesEnum {
  BUY = "BUY",
  RENT = "RENT",
}

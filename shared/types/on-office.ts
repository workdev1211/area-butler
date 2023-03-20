import { ApiCoordinates } from "./types";
import { TApiIntUserAvailProdContingents } from "./integration-user";

export enum OnOfficeProductTypesEnum {
  MAP_SNAPSHOT = "MAP_SNAPSHOT",
  OPEN_AI = "OPEN_AI",
  OPEN_AI_50 = "OPEN_AI_50",
  MAP_IFRAME = "MAP_IFRAME",
  MAP_IFRAME_50 = "MAP_IFRAME_50",
  ONE_PAGE = "ONE_PAGE",
  ONE_PAGE_50 = "ONE_PAGE_50",
}

export interface IOnOfficeProduct {
  title: string;
  description: string;
  type: OnOfficeProductTypesEnum;
  price: number;
}

export interface IApiOnOfficeUnlockProviderReq {
  token: string;
  secret: string;
  parameterCacheId: string;
  extendedClaim: string;
}

export interface IApiOnOfficeActivationReq {
  integrationUserId: string;
  token: string;
  parameterCacheId: string;
  extendedClaim: string;
}

export interface IApiOnOfficeActivationRes {
  providerData: string;
  scripts: Array<{ script: string }>;
}

export interface IApiOnOfficeRequest {
  token: string;
  request: { actions: IApiOnOfficeRequestAction[] };
}

export enum ApiOnOfficeActionIdsEnum {
  "READ" = "urn:onoffice-de-ns:smart:2.5:smartml:action:read",
  "CREATE" = "urn:onoffice-de-ns:smart:2.5:smartml:action:create",
  "MODIFY" = "urn:onoffice-de-ns:smart:2.5:smartml:action:modify",
  "GET" = "urn:onoffice-de-ns:smart:2.5:smartml:action:get",
  "DO" = "urn:onoffice-de-ns:smart:2.5:smartml:action:do",
  "DELETE" = "urn:onoffice-de-ns:smart:2.5:smartml:action:delete",
}

export enum ApiOnOfficeResourceTypesEnum {
  "UNLOCK_PROVIDER" = "unlockProvider",
  "ESTATE" = "estate",
  "FIELDS" = "fields", // field description - get all info about entity fields ("address", "estate", etc)
  "BASIC_SETTINGS" = "basicsettings",
}

interface IApiOnOfficeRequestAction {
  timestamp?: number;
  hmac: string;
  hmac_version: 2;
  actionid: ApiOnOfficeActionIdsEnum;
  resourceid: string;
  identifier: string;
  resourcetype: ApiOnOfficeResourceTypesEnum;
  parameters?: IApiOnOfficeRequestActionParameters;
}

interface IApiOnOfficeRequestActionParameters {
  parameterCacheId?: string;
  extendedclaim: string;
  isRegularCustomer?: number;
  data?: any;
}

// TODO make it the right way - without anys
export interface IApiOnOfficeResponse<T = any> {
  status: {
    code: number; // enum?
    errorcode: number; // enum?
    message: string; // enum?
  };
  response: {
    results: IApiOnOfficeResponseResult<T>[];
  };
}

interface IApiOnOfficeResponseResult<T> {
  actionid: ApiOnOfficeActionIdsEnum;
  resourceid: string;
  resourcetype: ApiOnOfficeResourceTypesEnum;
  identifier: string;
  status: {
    code: number; // enum?
    message: string; // enum?
  };
  data: {
    records: IApiOnOfficeResponseResultRecord<T>[];
  };
}

interface IApiOnOfficeResponseResultRecord<T> {
  id: string;
  type: string;
  elements: T;
}

export interface IApiOnOfficeResponseEstateElement {
  objekttitel: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  land: string;
  breitengrad: string;
  laengengrad: string;
  anzahl_zimmer: string;
  wohnflaeche: string;
  grundstuecksflaeche: string;
  energyClass: string;
  kaufpreis: string;
  waehrung: string;
  kaltmiete: string;
  warmmiete: string;
  anzahl_balkone: string;
  unterkellert: string;
}

export interface IApiOnOfficeLoginQueryParams {
  apiClaim: string; // extendedClaim
  customerName: string;
  customerWebId: string;
  parameterCacheId: string;
  timestamp: string;
  userId: string;
  estateId: string;
  signature: string;
  groupId?: string;
  imageIds?: string;
}

export interface IApiOnOfficeLoginReq {
  url: string; // for passing to the backend - NestJs gets incorrect protocol from request object
  onOfficeQueryParams: IApiOnOfficeLoginQueryParams;
}

export interface IApiOnOfficeLoginRes {
  address: string;
  coordinates: ApiCoordinates;
  estateId: string;
  integrationUserId: string;
  accessToken: string;
  availProdContingents?: TApiIntUserAvailProdContingents;
}

export interface IApiOnOfficeCreateOrderReq {
  products: IApiOnOfficeCreateOrderProduct[];
}

export interface IApiOnOfficeConfirmOrderQueryParams {
  message?: string;
  signature: string;
  status: ApiOnOfficeTransactionStatusesEnum;
  timestamp: string;
  errorCodes?: string;
  transactionid?: string;
  referenceid?: string;
}

export interface IApiOnOfficeConfirmOrderReq {
  url: string;
  product: IApiOnOfficeCreateOrderProduct;
  onOfficeQueryParams: IApiOnOfficeConfirmOrderQueryParams;
}

export interface IApiOnOfficeConfirmOrderRes {
  message?: string;
  availProdContingents?: TApiIntUserAvailProdContingents;
}

export interface IApiOnOfficeCreateOrderProduct {
  id?: string;
  type: OnOfficeProductTypesEnum;
  quantity: number;
}

export interface IApiOnOfficeFetchLatestSnapshotReq {
  integrationId: string;
}

export interface IApiOnOfficeProduct {
  name: string;
  price: string;
  quantity: string;
  circleofusers: "customer"; // enum
}

export interface IApiOnOfficeOrderData {
  callbackurl: string;
  parametercacheid: string;
  products: IApiOnOfficeProduct[];
  totalprice: string;
  timestamp: number;
  signature: string;
}

export interface IApiOnOfficeCreateOrderRes {
  onOfficeOrderData: IApiOnOfficeOrderData;
  products: IApiOnOfficeCreateOrderProduct[];
}

export enum ApiOnOfficeTransactionStatusesEnum {
  "SUCCESS" = "success",
  "INPROCESS" = "inprocess", // inprocess is SEPA specific status
  "ERROR" = "error",
}

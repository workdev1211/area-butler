import {
  TApiIntegrationUserConfig,
  TApiIntUserAvailProdContingents,
} from "./integration-user";
import { ApiRealEstateListing } from "./real-estate";
import {
  ApiSearchResultSnapshotResponse,
  RequestStatusTypesEnum,
} from "./types";
import { OpenAiQueryTypeEnum } from "./open-ai";

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
  name: string;
  type: OnOfficeProductTypesEnum;
  price: number;
  isDisabled?: boolean;
}

export interface IApiOnOfficeUnlockProviderReq {
  token: string;
  secret: string;
  parameterCacheId: string;
  extendedClaim: string;
}

export interface IApiOnOfficeActivationReq {
  apiClaim: string;
  apiToken: string;
  customerWebId: string;
  parameterCacheId: string;
  userId: string;
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
  cacheable?: boolean;
  identifier: string;
  status: {
    errorcode: number; // enum?
    message: string; // enum?
  };
  data: {
    meta?: {
      cntabsolute?: number;
    };
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
  integrationId: string;
  realEstate: ApiRealEstateListing;
  latestSnapshot?: ApiSearchResultSnapshotResponse;
  accessToken: string;
  config: TApiIntegrationUserConfig;
  availProdContingents?: TApiIntUserAvailProdContingents;
}

export interface IApiOnOfficeCreateOrderReq {
  integrationId: string;
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
  accessToken: string;
  integrationId: string;
  products: string;
}

export interface IApiOnOfficeConfirmOrderReq {
  url: string;
  onOfficeQueryParams: IApiOnOfficeConfirmOrderQueryParams;
}

export interface IApiOnOfficeUpdateEstateReq {
  queryType: OpenAiQueryTypeEnum;
  queryResponse: string;
}

export interface IApiOnOfficeConfirmOrderErrorRes {
  message: string;
}

export type TApiOnOfficeConfirmOrderRes =
  | IApiOnOfficeLoginRes
  | IApiOnOfficeConfirmOrderErrorRes;

export interface IApiOnOfficeCreateOrderProduct {
  transactionDbId?: string;
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
}

export enum ApiOnOfficeTransactionStatusesEnum {
  "SUCCESS" = "success",
  "INPROCESS" = "inprocess", // inprocess is SEPA specific status
  "ERROR" = "error",
}

export enum OnOfficeLoginActionTypesEnum {
  "PERFORM_LOGIN" = "PERFORM_LOGIN",
  "CONFIRM_ORDER" = "CONFIRM_ORDER",
}

export interface IOnOfficeHandleLogin {
  requestStatus: RequestStatusTypesEnum;
  actionType?: OnOfficeLoginActionTypesEnum;
  message?: string;
}

export enum OnOfficeIntActTypesEnum {
  "UNLOCK_IFRAME" = "UNLOCK_IFRAME",
}

export type TOnOfficeIntActTypes =
  | OpenAiQueryTypeEnum
  | OnOfficeIntActTypesEnum;

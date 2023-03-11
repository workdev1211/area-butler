import {
  IApiSubscriptionEnvIds,
  PaymentSystemTypeEnum,
} from "./subscription-plan";
import { IntegrationTypesEnum } from "./types";

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
  priceIds: any;
}

export type TPriceIds = {
  [key in PaymentSystemTypeEnum]?: IApiSubscriptionEnvIds;
};

export interface IApiOnOfficeUnlockProvider {
  token: string;
  secret: string;
  parameterCacheId: string;
  extendedClaim: string;
}

export interface IApiOnOfficeRenderData {
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
  data?: string[]; // enum?
}

export interface IApiOnOfficeResponse {
  status: {
    code: number; // enum?
    errorcode: number; // enum?
    message: string; // enum?
  };
  response: {
    results: IApiOnOfficeResponseResult[];
  };
}

interface IApiOnOfficeResponseResult {
  actionid: ApiOnOfficeActionIdsEnum;
  resourceid: string;
  resourcetype: ApiOnOfficeResourceTypesEnum;
  identifier: string;
  status: {
    code: number; // enum?
    message: string; // enum?
  };
  data: {
    records: IApiOnOfficeResponseResultRecord[];
  };
}

interface IApiOnOfficeResponseResultRecord {
  id: string;
  type: string;
  elements: Array<{ [key: string]: string }>;
}

export interface IApiOnOfficeRequestParams {
  url?: string; // for passing to the backend - NestJs gets incorrect protocol from request object
  apiClaim: string; // extendedClaim
  customerName: string;
  customerWebId: string;
  parameterCacheId: string;
  timestamp: string;
  userId: string;
  estateId: string;
  groupId?: string;
  signature: string;
  imageIds?: string;
}

export interface IApiOnOfficeCreateOrder {
  parameterCacheId: string;
  products: IApiOnOfficeCreateOrderProduct[];
}

export interface IApiOnOfficeConfirmOrder {
  url?: string; // for passing to the backend - NestJs gets incorrect protocol from request object
  extendedClaim?: string; // from OnOfficeContext
  timestamp: string;
  signature: string;
  message?: string;
  referenceid: string;
  transactionid: string;
  status: "success";
}

export interface IApiOnOfficeCreateOrderProduct {
  type: OnOfficeProductTypesEnum;
  quantity: number;
}

export interface IApiOnOfficeFindCreateSnapshot {
  estateId: string;
  extendedClaim: string;
  integrationType: IntegrationTypesEnum;
}

import {
  IApiSubscriptionEnvIds,
  PaymentSystemTypeEnum,
} from "./subscription-plan";

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

interface IApiOnOfficeRequestAction {
  timestamp: number;
  hmac: string;
  hmac_version: 2;
  actionid: string; // enum
  resourceid: string;
  resourcetype: string; // enum
  parameters: IApiOnOfficeRequestActionParameters;
}

interface IApiOnOfficeRequestActionParameters {
  parameterCacheId: string;
  extendedclaim: string;
  isRegularCustomer?: number;
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
  actionid: string; // enum
  resourceid: string;
  resourcetype: string; // enum
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
  apiClaim: string;
  customerName: string;
  customerWebId: string;
  parameterCacheId: string;
  timestamp: string;
  userId: string;
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
  userId?: string; // from OnOfficeContext
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
  integrationId: string;
  integrationUserId: string;
}

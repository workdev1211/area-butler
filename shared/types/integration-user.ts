import { IntegrationTypesEnum } from "./integration";
import { ApiSearchResultSnapshotResponse, IApiUserPoiIcons } from "./types";
import { OpenAiQueryTypeEnum } from "./open-ai";
import { ApiRealEstateListing } from "./real-estate";
import { TIntegrationUserDocument } from "../../backend/src/user/schema/integration-user.schema";
import { TCompanyDocument } from "../../backend/src/company/schema/company.schema";
import { IUserConfig } from "./user";

export interface IIntegrationUserSchema {
  accessToken: string; // for AreaButler internal identification purposes
  companyId: string;
  config: IUserConfig;
  integrationType: IntegrationTypesEnum;
  integrationUserId: string;

  company?: TCompanyDocument;
  parameters?: TApiIntegrationUserParameters;

  // OLD
  isParent?: boolean;
  parentId?: string;
  parentUser?: TIntegrationUserDocument;
  productContingents?: TApiIntegrationUserProductContingents;
  productsUsed?: TApiIntegrationUserProductsUsed;
  subscription?: IIntUserSubscription;
}

export interface IApiIntegrationUser {
  accessToken: string;
  config: IUserConfig;
  integrationUserId: string;
  isChild: boolean;
  availProdContingents?: TApiIntUserAvailProdContingents;
  subscription?: IIntUserSubscription;
  poiIcons?: IApiUserPoiIcons;
}

export type TApiIntUserAvailProdContingents = Partial<
  Record<TApiIntUserProdContType, number>
>;

export interface IIntUserSubscription {
  expiresAt: Date;
}

export interface IApiIntUserOnOfficeParams {
  parameterCacheId?: string;
  customerName?: string;
  customerWebId?: string; // OnOffice account id
  userId?: string; // OnOffice account user id
  userName?: string;
  extendedClaim: string; // used by us as an access token
  apiKey?: string; // client secret
  token?: string; // client access token
  email?: string;
}

export interface IApiPropstackStoredBroker {
  brokerId: number;
  email: string;
  name: string;
}

export interface IApiIntUserPropstackParams {
  apiKey?: string;
  shopId?: number;
  teamId?: number;
  brokerId?: number;
  brokers?: IApiPropstackStoredBroker[];
}

// IMPORTANT
// The products are arranged in a certain order representing their hierarchy.
// Please, check the 'getProdContTypeByActType' method for better understanding.
export enum ApiIntUserOnOfficeProdContTypesEnum {
  OPEN_AI = "OPEN_AI", // P2 - NEW P1
  MAP_IFRAME = "MAP_IFRAME", // P3 - LEGACY
  ONE_PAGE = "ONE_PAGE", // P4 - LEGACY
  STATS_EXPORT = "STATS_EXPORT", // P5 - NEW P2
}

export enum ApiIntUserPropstackProdContTypesEnum {
  OPEN_AI = "OPEN_AI",
  STATS_EXPORT = "STATS_EXPORT",
}

export type TApiIntUserProdContType =
  | keyof typeof ApiIntUserOnOfficeProdContTypesEnum
  | keyof typeof ApiIntUserPropstackProdContTypesEnum;

export interface IApiIntUserOnOfficeProduct {
  type: ApiIntUserOnOfficeProdContTypesEnum;
  quantity: number;
}

export type TApiIntegrationUserProduct = IApiIntUserOnOfficeProduct;

export interface IApiIntegrationUserProductContingent {
  expiresAt: Date;
  quantity: number;
}

export interface IApiIntUserUpdateParamsAndConfig {
  accessToken: string;
  parameters: TApiIntegrationUserParameters;
  config?: Partial<IUserConfig>;
}

export interface IApiIntUserCreate extends IApiIntUserUpdateParamsAndConfig {
  companyId: string;
  integrationType: IntegrationTypesEnum;
  integrationUserId: string;

  isParent?: boolean;
  isContingentProvided?: boolean;
  parentId?: string;
}

export type TApiIntegrationUserParameters =
  | IApiIntUserOnOfficeParams
  | IApiIntUserPropstackParams;
export type TApiIntegrationUserProductContingents = Partial<
  Record<TApiIntUserProdContType, IApiIntegrationUserProductContingent[]>
>;
export type TApiIntegrationUserProductsUsed = Partial<
  Record<TApiIntUserProdContType, number>
>;

export interface IIntUserExpMatchParams {
  fieldId: string;
  maxTextLength?: number;
}

export interface IApiIntUserLoginRes {
  accessToken: string;
  config: IUserConfig;
  integrationUserId: string;
  isChild: boolean;
  realEstate: ApiRealEstateListing;
  availProdContingents?: TApiIntUserAvailProdContingents;
  latestSnapshot?: ApiSearchResultSnapshotResponse;
  openAiQueryType?: OpenAiQueryTypeEnum;
  subscription?: IIntUserSubscription;
  poiIcons?: IApiUserPoiIcons;
}

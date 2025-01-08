import { IntegrationTypesEnum } from "./integration";
import { ApiSearchResultSnapshotResponse, IApiPoiIcons } from "./types";
import { OpenAiQueryTypeEnum } from "./open-ai";
import { ApiRealEstateListing } from "./real-estate";
import { TIntegrationUserDocument } from "../../backend/src/user/schema/integration-user.schema";
import { TCompanyDocument } from "../../backend/src/company/schema/company.schema";
import { IApiUserConfig, IUserConfig, UserRoleEnum } from "./user";

export interface IIntegrationUserSchema {
  accessToken: string; // for AreaButler internal identification purposes
  companyId: string;
  config: IUserConfig;
  integrationType: IntegrationTypesEnum;
  integrationUserId: string;
  isAdmin: boolean;
  role: UserRoleEnum;

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
  config: IApiUserConfig;
  integrationUserId: string;
  isAdmin: boolean;
  isChild: boolean;
  availProdContingents?: TApiIntUserAvailProdContingents;
  poiIcons?: IApiPoiIcons;
  subscription?: IIntUserSubscription;
}

export type TApiIntUserAvailProdContingents = Partial<
  Record<TApiIntUserProdContType, number>
>;

export interface IIntUserSubscription {
  expiresAt: Date;
}

export interface IApiIntUserOnOfficeParams {
  apiKey?: string; // client secret
  customerName?: string;
  customerWebId?: string; // OnOffice account id
  email?: string;
  extendedClaim?: string; // used by us as an access token
  parameterCacheId?: string;
  token?: string; // client access token
  userId?: string; // OnOffice account user id
  userName?: string;
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

export interface IIntUserExpMatchLinkParams {
  isSpecialLink: true;

  isEmbedable?: boolean;
  isPrivate?: boolean;
  onLandingPage?: boolean;

  fieldId?: never;
  maxTextLength?: never;
}

export interface IIntUserExpMatchTextParams {
  fieldId: string;

  isSpecialLink?: false;
  maxTextLength?: number;

  isEmbedable?: never;
  isPrivate?: never;
  onLandingPage?: never;
}

export type TIntUserExpMatchParams =
  | IIntUserExpMatchLinkParams
  | IIntUserExpMatchTextParams;

export interface IApiIntUserLoginRes {
  integrationUser: IApiIntegrationUser;
  realEstate: ApiRealEstateListing;
  latestSnapshot?: ApiSearchResultSnapshotResponse;
  openAiQueryType?: OpenAiQueryTypeEnum;
}

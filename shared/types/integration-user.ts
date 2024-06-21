import { IntegrationTypesEnum } from "./integration";
import {
  ApiSearchResultSnapshotResponse,
  ApiShowTour,
  IApiMapboxStyle,
  LanguageTypeEnum,
} from "./types";
import { OpenAiQueryTypeEnum } from "./open-ai";
import { ApiRealEstateListing } from "./real-estate";
import { Iso3166_1Alpha2CountriesEnum } from "./location";
import { TIntegrationUserDocument } from "../../backend/src/user/schema/integration-user.schema";

export interface IApiIntegrationUserSchema {
  accessToken: string; // for AreaButler internal identification purposes
  integrationType: IntegrationTypesEnum;
  integrationUserId: string;
  config?: TApiIntegrationUserConfig;
  isParent?: boolean;
  isSubscriptionActive?: boolean;
  parameters?: TApiIntegrationUserParameters;
  parentId?: string;
  parentUser?: TIntegrationUserDocument;
  productContingents?: TApiIntegrationUserProductContingents;
  productsUsed?: TApiIntegrationUserProductsUsed;
  subscription?: IIntUserSubscription;
}

export interface IApiIntegrationUser {
  accessToken: string;
  config: TApiIntegrationUserConfig;
  integrationUserId: string;
  isChild: boolean;
  availProdContingents?: TApiIntUserAvailProdContingents;
  subscription?: IIntUserSubscription;
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
  quantity: number;
  expiresAt: Date;
}

export interface IApiIntUserUpdateParamsAndConfig {
  accessToken: string;
  parameters: TApiIntegrationUserParameters;
  config?: Partial<TApiIntegrationUserConfig>;
}

export interface IApiIntUserCreate extends IApiIntUserUpdateParamsAndConfig {
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
export type TApiIntegrationUserConfig = {
  language: LanguageTypeEnum;
  mapboxAccessToken?: string;
  hideProductPage?: boolean;
  color?: string;
  logo?: string;
  mapIcon?: string;
  showTour: ApiShowTour;
  exportMatching?: Record<TAreaButlerExportTypes, IIntUserExpMatchParams>;
  templateSnapshotId?: string;
  extraMapboxStyles?: IApiMapboxStyle[];
  isSpecialLink?: boolean;
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[]; // ["DE","ES","CY","KW","OM","QA","SA","AE","IC","HR","AT","CH"]
};

export type TAreaButlerExportTypes =
  | OpenAiQueryTypeEnum
  | AreaButlerExportTypesEnum;

export enum AreaButlerExportTypesEnum {
  EMBEDDED_LINKS = "EMBEDDED_LINKS",
  QR_CODE = "QR_CODE",
  INLINE_FRAME = "INLINE_FRAME",
  ONE_PAGE_PNG = "ONE_PAGE_PNG",
  SCREENSHOT = "SCREENSHOT",
}

export interface IIntUserExpMatchParams {
  fieldId: string;
  maxTextLength?: number;
}

export interface IApiIntUserLoginRes {
  accessToken: string;
  config: TApiIntegrationUserConfig;
  integrationUserId: string;
  isChild: boolean;
  realEstate: ApiRealEstateListing;
  availProdContingents?: TApiIntUserAvailProdContingents;
  latestSnapshot?: ApiSearchResultSnapshotResponse;
  openAiQueryType?: OpenAiQueryTypeEnum;
  subscription?: IIntUserSubscription;
}

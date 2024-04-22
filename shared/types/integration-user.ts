import { IntegrationTypesEnum } from "./integration";
import {
  ApiSearchResultSnapshotResponse,
  ApiShowTour,
  IApiMapboxStyle,
} from "./types";
import { OpenAiQueryTypeEnum } from "./open-ai";
import { ApiRealEstateListing } from "./real-estate";
import { Iso3166_1Alpha2CountriesEnum } from "./location";

export interface IApiIntegrationUserSchema {
  integrationUserId: string;
  integrationType: IntegrationTypesEnum;
  accessToken: string; // for AreaButler internal identification purposes
  parameters?: TApiIntegrationUserParameters;
  config?: TApiIntegrationUserConfig;
  productsUsed?: TApiIntegrationUserProductsUsed;
  productContingents?: TApiIntegrationUserProductContingents;
  parentId?: string;
  isParent?: boolean;
  // obsolete, moved to a separate collection
  usageStatistics?: TApiIntegrationUserUsageStatistics;
}

export interface IApiIntegrationUser {
  integrationUserId: string;
  accessToken: string;
  config: TApiIntegrationUserConfig;
  isChild: boolean;
  availProdContingents?: TApiIntUserAvailProdContingents;
}

export type TApiIntUserAvailProdContingents = Partial<
  Record<TApiIntUserProdContTypes, number>
>;

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
  MAP_SNAPSHOT = "MAP_SNAPSHOT", // P1 - free package
  OPEN_AI = "OPEN_AI", // P2
  MAP_IFRAME = "MAP_IFRAME", // P3
  ONE_PAGE = "ONE_PAGE", // P4
  STATS_EXPORT = "STATS_EXPORT", // P5
  SUBSCRIPTION = "SUBSCRIPTION",
}

export enum ApiIntUserPropstackProdContTypesEnum {
  COMPLETE = "COMPLETE",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export type TApiIntUserOnOfficeUsageStatsTypes =
  ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT;

export type TApiIntUserUsageStatsTypes = TApiIntUserOnOfficeUsageStatsTypes;

export type TApiIntUserUsageStatisticsMetrics = {
  [year: number]: { [month: number]: { [date: number]: number } };
};

export interface IApiIntUserOnOfficeProduct {
  type: ApiIntUserOnOfficeProdContTypesEnum;
  quantity: number;
}

export type TApiIntUserProdContTypes =
  keyof typeof ApiIntUserOnOfficeProdContTypesEnum |
  keyof typeof ApiIntUserPropstackProdContTypesEnum;

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
  integrationUserId: string;
  integrationType: IntegrationTypesEnum;
  parentId?: string;
  isParent?: boolean;
}

export type TApiIntegrationUserParameters =
  | IApiIntUserOnOfficeParams
  | IApiIntUserPropstackParams;
export type TApiIntegrationUserProductContingents = Partial<
  Record<TApiIntUserProdContTypes, IApiIntegrationUserProductContingent[]>
>;
export type TApiIntegrationUserProductsUsed = Partial<
  Record<TApiIntUserProdContTypes, number>
>;
export type TApiIntegrationUserConfig = {
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
export type TApiIntegrationUserUsageStatistics = Partial<
  Record<TApiIntUserUsageStatsTypes, TApiIntUserUsageStatisticsMetrics>
>;

export type TAreaButlerExportTypes =
  | OpenAiQueryTypeEnum
  | AreaButlerExportTypesEnum;

export enum AreaButlerExportTypesEnum {
  EMBEDDED_LINK_WITH_ADDRESS = "EMBEDDED_LINK_WITH_ADDRESS",
  EMBEDDED_LINK_WO_ADDRESS = "EMBEDDED_LINK_WO_ADDRESS",
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
  integrationUserId: string;
  accessToken: string;
  config: TApiIntegrationUserConfig;
  isChild: boolean;
  realEstate: ApiRealEstateListing;
  latestSnapshot?: ApiSearchResultSnapshotResponse;
  availProdContingents?: TApiIntUserAvailProdContingents;
  openAiQueryType?: OpenAiQueryTypeEnum;
}

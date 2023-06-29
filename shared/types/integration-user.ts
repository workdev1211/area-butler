import { IntegrationTypesEnum, TIntegrationActionTypes } from "./integration";
import { ApiShowTour } from "./types";
import { OpenAiQueryTypeEnum } from "./open-ai";

export interface IApiIntegrationUserSchema {
  integrationUserId: string;
  integrationType: IntegrationTypesEnum;
  accessToken: string;
  parameters?: TApiIntegrationUserParameters;
  config?: TApiIntegrationUserConfig;
  userId?: string;
  productsUsed?: TApiIntegrationUserProductsUsed;
  productContingents?: TApiIntegrationUserProductContingents;
  usageStatistics?: TApiIntegrationUserUsageStatistics;
}

export interface IApiIntegrationUser {
  integrationUserId: string;
  accessToken: string;
  config: TApiIntegrationUserConfig;
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
  extendedClaim: string; // used by us as access token
  apiKey?: string; // client secret
  token?: string; // client access token
  email?: string;
}

// IMPORTANT
// The products are arranged in a certain order representing their hierarchy.
// Please, check the 'getProdContTypeByActType' method for better understanding.
export enum ApiIntUserOnOfficeProdContTypesEnum {
  MAP_SNAPSHOT = "MAP_SNAPSHOT",
  OPEN_AI = "OPEN_AI",
  MAP_IFRAME = "MAP_IFRAME",
  ONE_PAGE = "ONE_PAGE",
  STATS_EXPORT = "STATS_EXPORT",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export type TApiIntUserOnOfficeUsageStatsParamNames =
  ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT;

export type TApiIntUserUsageStatsParamNames =
  TApiIntUserOnOfficeUsageStatsParamNames;

export type TApiIntUserUsageStatisticsMetrics = {
  [year: number]: { [month: number]: { [date: number]: number } };
};

export interface IApiIntUserOnOfficeProduct {
  type: ApiIntUserOnOfficeProdContTypesEnum;
  quantity: number;
}

export type TApiIntUserProdContTypes = ApiIntUserOnOfficeProdContTypesEnum;

export type TApiIntegrationUserProduct = IApiIntUserOnOfficeProduct;

export interface IApiIntegrationUserProductContingent {
  quantity: number;
  expiresAt: Date;
}

export interface IApiIntUserUpdateParamsAndConfig {
  accessToken: string;
  parameters: TApiIntegrationUserParameters;
  config?: TApiIntegrationUserConfig;
}

export interface IApiIntUserCreate extends IApiIntUserUpdateParamsAndConfig {
  integrationUserId: string;
  integrationType: IntegrationTypesEnum;
}

export type TApiIntegrationUserParameters = IApiIntUserOnOfficeParams;
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
};
export type TApiIntegrationUserUsageStatistics = Partial<
  Record<TApiIntUserUsageStatsParamNames, TApiIntUserUsageStatisticsMetrics>
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

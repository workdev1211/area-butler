import { IntegrationTypesEnum } from "./integration";

export interface IApiIntegrationUser {
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

export type TApiIntUserAvailProdContingents = Partial<
  Record<TApiIntUserAvailProdContTypes, number>
>;

export type TApiIntUserAvailProdContTypes = ApiIntUserOnOfficeProdContTypesEnum;

export interface IApiIntUserAvailProdContingents {
  availProdContingents: TApiIntUserAvailProdContingents;
}

export interface IApiIntUserOnOfficeParams {
  parameterCacheId?: string;
  extendedClaim: string;
  apiKey?: string;
  token?: string;
}

export enum ApiIntUserOnOfficeProdContTypesEnum {
  MAP_SNAPSHOT = "MAP_SNAPSHOT",
  OPEN_AI = "OPEN_AI",
  MAP_IFRAME = "MAP_IFRAME",
  ONE_PAGE = "ONE_PAGE",
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

export type TApiIntegrationUserParameters = IApiIntUserOnOfficeParams;
export type TApiIntegrationUserProductContingents = Partial<
  Record<TApiIntUserProdContTypes, IApiIntegrationUserProductContingent[]>
>;
export type TApiIntegrationUserProductsUsed = Partial<
  Record<TApiIntUserProdContTypes, number>
>;
export type TApiIntegrationUserConfig = {
  mapboxAccessToken?: string;
  showProductPage?: boolean;
  color?: string;
  logo?: string;
};
export type TApiIntegrationUserUsageStatistics = Partial<
  Record<TApiIntUserUsageStatsParamNames, TApiIntUserUsageStatisticsMetrics>
>;

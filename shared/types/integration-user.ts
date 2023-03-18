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

export interface IApiIntUserAvailProdContingents {
  availProdContingents: TApiIntUserOnOfficeAvailProdContingents;
}

export type TApiIntUserOnOfficeAvailProdContingents = Partial<
  Record<ApiIntUserOnOfficeProdContTypesEnum, number>
>;

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

export interface IApiIntUserOnOfficeConfig {
  showProductPage?: boolean;
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

export type TApiIntegrationUserProduct = IApiIntUserOnOfficeProduct;

export interface IApiIntegrationUserProductContingent {
  quantity: number;
  expiresAt: Date;
}

export type TApiIntUserOnOfficeProductContingents = Record<
  ApiIntUserOnOfficeProdContTypesEnum,
  IApiIntegrationUserProductContingent[]
>;

export type TApiIntUserAvailableProductContingents = Record<
  ApiIntUserOnOfficeProdContTypesEnum,
  number
>;

export type TApiIntUserOnOfficeProductsUsed = Record<
  ApiIntUserOnOfficeProdContTypesEnum,
  number
>;

export type TApiIntegrationUserParameters = IApiIntUserOnOfficeParams;
export type TApiIntegrationUserProductContingents =
  TApiIntUserOnOfficeProductContingents;
export type TApiIntegrationUserProductsUsed = TApiIntUserOnOfficeProductsUsed;
export type TApiIntegrationUserConfig = {
  mapboxAccessToken: string;
} & IApiIntUserOnOfficeConfig;
export type TApiIntegrationUserUsageStatistics = Record<
  TApiIntUserUsageStatsParamNames,
  TApiIntUserUsageStatisticsMetrics
>;

import { OnOfficeProductTypesEnum } from "./on-office";

export interface IApiIntUserOnOfficeParams {
  parameterCacheId?: string;
  extendedClaim: string;
  apiKey?: string;
  token?: string;
}

export enum ApiIntUserOnOfficeProdContTypesEnum {
  OPEN_AI = "OPEN_AI",
  MAP_IFRAME = "MAP_IFRAME",
  ONE_PAGE = "ONE_PAGE",
}

export interface IApiIntUserOnOfficeConfig {
  showProductPage?: boolean;
}

export type TApiIntUserUsageStatisticsMetrics = {
  [year: number]: { [month: number]: { [date: number]: number } };
};

export interface IApiIntUserOnOfficeUsageStats {
  [OnOfficeProductTypesEnum.MAP_SNAPSHOT]: TApiIntUserUsageStatisticsMetrics;
}

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

export type TApiIntUserOnOfficeProductsUsed = Record<
  ApiIntUserOnOfficeProdContTypesEnum,
  number
>;

export type TApiIntUserAvailableProductContingents = Record<
  ApiIntUserOnOfficeProdContTypesEnum,
  number
>;

export type TApiIntegrationUserParameters = IApiIntUserOnOfficeParams;
export type TApiIntegrationUserProductContingents =
  TApiIntUserOnOfficeProductContingents;
export type TApiIntegrationUserProductsUsed = TApiIntUserOnOfficeProductsUsed;
export type TApiIntegrationUserConfig = IApiIntUserOnOfficeConfig;
export type TApiIntegrationUserUsageStatistics = IApiIntUserOnOfficeUsageStats;

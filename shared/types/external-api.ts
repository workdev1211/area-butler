import { IntegrationTypesEnum } from "./integration";
import { ApiHereLanguageEnum } from "./here";
import { ApiLocIndexFeatPropsEnum } from "./location-index";
import {
  ApiCoordinates,
  ApiGeojsonType,
  ApiOsmLocation,
  ApiRequestStatusesEnum,
  MeansOfTransportation,
} from "./types";
import { TProcessedCensusData } from "./data-provision";
import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCostType,
} from "./real-estate";
import { OpenAiTonalityEnum } from "./open-ai";

export interface IApiKeyParams {
  apiKey: string;
  allowedFeatures: ApiFeatureTypesEnum[];
}

export enum ApiUnitsOfTransportEnum {
  MINUTES = "MIN",
  METERS = "M",
  KILOMETERS = "KM",
}

export enum ApiFeatureTypesEnum {
  ADDRESSES_IN_RANGE = "ADDRESSES_IN_RANGE",
  LOCATION_INDICES = "LOCATION_INDICES",
  ZENSUS_ATLAS = "ZENSUS_ATLAS",
  POI_DATA = "POI_DATA",
  OPEN_AI = "OPEN_AI",
}

export enum ApiUsageStatsTypesEnum {
  ADDRESSES_IN_RANGE = "addressesInRange",
  LOCATION_INDICES = "locationIndices",
  ZENSUS_ATLAS = "zensusAtlas",
  POI_DATA = "poiData",
  OPEN_AI = "openAi",
}

export enum ApiAddrInRangeApiTypesEnum {
  HERE = "here",
  GOOGLE = "google",
}

export enum ApiOpenAiQueryTypesEnum {
  "LOC_DESC" = "LOC_DESC",
  "EST_DESC" = "EST_DESC",
  "LOC_EST_DESC" = "LOC_EST_DESC",
}

export interface IApiUsageStatisticsSchema {
  userId: string;
  integrationType: IntegrationTypesEnum;
  timestamp: string;
  statistics: TApiUsageStatistics;
}

export type TApiUsageStatistics = Record<
  ApiUsageStatsTypesEnum,
  Array<TApiUsageStatsReqStatus>
>;

export type TApiUsageStatsReqStatus =
  | IApiQueryLocIndicesReqStatus
  | IApiFetchAddrInRangeReqStatus
  | IApiFetchPoiDataReqStatus;

export interface IExternalApiReqStatus<T> {
  status: ApiRequestStatusesEnum;
  queryParams: T;
  coordinates?: ApiCoordinates;
  message?: string;
}

export interface IExternalApiRes<T> {
  input: { coordinates: ApiCoordinates };
  result: T;
}

export interface IApiCoordinatesOrAddress {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface IApiQueryLocIndicesReq extends IApiCoordinatesOrAddress {
  type?: ApiGeojsonType;
}

export interface IApiQueryLocIndicesReqStatus
  extends IExternalApiReqStatus<IApiQueryLocIndicesReq> {}

export interface IApiQueryLocIndicesRes
  extends IExternalApiRes<Record<ApiLocIndexFeatPropsEnum, number>> {}

export interface IApiQueryZensusAtlasRes
  extends IExternalApiRes<TProcessedCensusData> {}

export interface IApiAddressInRange {
  full_address: string;
  street_name: string;
  street_number: string;
  postal_code: string;
  locality: string;
  country: string;
  location: ApiCoordinates;
  distance_in_meters: number;
}

export interface IApiFetchAddrInRangeReq extends IApiCoordinatesOrAddress {
  radius?: number;
  language?: ApiHereLanguageEnum;
  apiType?: ApiAddrInRangeApiTypesEnum;
}

export interface IApiFetchAddrInRangeReqStatus
  extends IExternalApiReqStatus<IApiFetchAddrInRangeReq> {
  sourceAddress?: string;
  returnedAddressesNumber?: number;
  apiType?: ApiAddrInRangeApiTypesEnum;
  apiRequestsNumber?: number;
}

export interface IApiFetchAddrInRangeRes
  extends IExternalApiRes<{
    addresses_number: number;
    addresses: IApiAddressInRange[];
  }> {}

export interface IApiFetchPoiDataReq extends IApiCoordinatesOrAddress {
  poiNumber?: number;
  transportMode?: MeansOfTransportation;
  distance?: number;
  unit?: ApiUnitsOfTransportEnum;
}

export interface IApiFetchPoiDataReqStatus
  extends IExternalApiReqStatus<IApiFetchPoiDataReq> {}

export interface IApiFetchPoiDataRes
  extends IExternalApiRes<ApiOsmLocation[]> {}

export interface IApiQueryOpenAiResExtReq extends IApiFetchPoiDataReq {
  queryType?: ApiOpenAiQueryTypesEnum;
  tonality?: OpenAiTonalityEnum;

  price?: number;
  priceType?: ApiRealEstateCostType;
  housingArea?: number;
  totalArea?: number;
  energyEfficiency?: ApiEnergyEfficiency;
  furnishing: ApiFurnishing[];
}

export interface IApiQueryOpenAiResExtReqStatus
  extends IExternalApiReqStatus<IApiQueryOpenAiResExtReq> {}

export interface IApiQueryOpenAiResExtRes extends IExternalApiRes<string> {}

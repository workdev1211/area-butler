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
}

export enum ApiUsageStatsTypesEnum {
  ADDRESSES_IN_RANGE = "addressesInRange",
  LOCATION_INDICES = "locationIndices",
  ZENSUS_ATLAS = "zensusAtlas",
  POI_DATA = "poiData",
}

export enum ApiAddrInRangeApiTypesEnum {
  HERE = "here",
  GOOGLE = "google",
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
  transportMode?: MeansOfTransportation;
  distance?: number;
  unit?: ApiUnitsOfTransportEnum;
}

export interface IApiFetchPoiDataReqStatus
  extends IExternalApiReqStatus<IApiFetchPoiDataReq> {}

export interface IApiFetchPoiDataRes
  extends IExternalApiRes<ApiOsmLocation[]> {}

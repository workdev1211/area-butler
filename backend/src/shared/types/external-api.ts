import { IntegrationTypesEnum } from '@area-butler-types/integration';
import { ApiHereLanguageEnum } from './here';
import {
  ApiCoordinates,
  ApiGeojsonType,
  ApiOsmLocation,
  ApiRequestStatusesEnum,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import { TProcessedCensusData } from '@area-butler-types/data-provision';
import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import { OpenAiTonalityEnum } from '@area-butler-types/open-ai';
import { TApiLocIndexProps } from '@area-butler-types/location-index';

export interface IApiKeyParams {
  apiKey: string;
  allowedFeatures: ApiFeatureTypesEnum[];
}

export enum ApiUnitsOfTransportEnum {
  MINUTES = 'MIN',
  METERS = 'M',
  KILOMETERS = 'KM',
}

export enum ApiFeatureTypesEnum {
  ADDRESSES_IN_RANGE = 'ADDRESSES_IN_RANGE',
  LOCATION_INDICES = 'LOCATION_INDICES',
  TRIGGER_OVERPASS = 'TRIGGER_OVERPASS',
  SNAPSHOT_DATA = 'SNAPSHOT_DATA',
  ZENSUS_ATLAS = 'ZENSUS_ATLAS',
  POI_DATA = 'POI_DATA',
  OPEN_AI = 'OPEN_AI',
}

export enum ApiUsageStatsTypesEnum {
  ADDRESSES_IN_RANGE = 'addressesInRange',
  LOCATION_INDICES = 'locationIndices',
  SNAPSHOT_DATA = 'snapshotData',
  ZENSUS_ATLAS = 'zensusAtlas',
  POI_DATA = 'poiData',
  OPEN_AI = 'openAi',
}

export enum ApiAddrInRangeApiTypesEnum {
  HERE = 'here',
  GOOGLE = 'google',
}

export enum ApiOpenAiQueryTypesEnum {
  'LOC_DESC' = 'LOC_DESC',
  'EST_DESC' = 'EST_DESC',
  'LOC_EST_DESC' = 'LOC_EST_DESC',
}

export enum SnapshotDataTypesEnum {
  // TODO later
  // IMAGE = "IMAGE",
  QR_CODE = 'QR_CODE',
  DIRECT_LINK = 'DIRECT_LINK',
  IFRAME_CODE = 'IFRAME_CODE',
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
  input: { coordinates: ApiCoordinates; address?: string };
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
  extends IExternalApiRes<TApiLocIndexProps> {}

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

export interface IApiQueryOpenAiExtReq extends IApiFetchPoiDataReq {
  queryType?: ApiOpenAiQueryTypesEnum;
  tonality?: OpenAiTonalityEnum;

  price?: number;
  priceType?: ApiRealEstateCostType;
  housingArea?: number;
  totalArea?: number;
  energyEfficiency?: ApiEnergyEfficiency;
  furnishing?: ApiFurnishing[];
}

export interface IApiQueryOpenAiExtReqStatus
  extends IExternalApiReqStatus<IApiQueryOpenAiExtReq> {}

export interface IApiQueryOpenAiExtRes extends IExternalApiRes<string> {}

export interface IApiFetchSnapshotDataReq extends IApiFetchPoiDataReq {
  responseType?: SnapshotDataTypesEnum;
  snapshotId?: string;
  templateSnapshotId?: string;
  poiTypes?: OsmName[];
}

export interface IApiFetchSnapshotDataReqStatus
  extends IExternalApiReqStatus<IApiFetchSnapshotDataReq> {}

export interface IApiFetchSnapshotDataRes extends IExternalApiRes<string> {
  snapshotId: string;
}

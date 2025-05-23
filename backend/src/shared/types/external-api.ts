import { Language } from '@googlemaps/google-maps-services-js';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  ApiCoordinates,
  ApiGeojsonType,
  ApiOsmLocation,
  MeansOfTransportation,
  OsmName,
  ResultStatusEnum,
} from '@area-butler-types/types';
import { TProcessedCensusData } from '@area-butler-types/data-provision';
import {
  ApiBcp47LanguageEnum,
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
  OPEN_AI = 'OPEN_AI',
  POI_DATA = 'POI_DATA',
  SNAPSHOT_DATA = 'SNAPSHOT_DATA',
  ZENSUS_ATLAS = 'ZENSUS_ATLAS',
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
  'DISTRICT_DESC' = 'DISTRICT_DESC',
}

export enum SnapshotDataTypesEnum {
  // TODO later
  // IMAGE = "IMAGE",
  QR_CODE = 'QR_CODE',
  DIRECT_LINK = 'DIRECT_LINK',
  IFRAME_CODE = 'IFRAME_CODE',
}

export interface IApiUsageStatisticsSchema {
  integrationType: IntegrationTypesEnum;
  statistics: TApiUsageStatistics;
  timestamp: string;
  userId: string;
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
  status: ResultStatusEnum;
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

export type IApiQueryLocIndicesReqStatus =
  IExternalApiReqStatus<IApiQueryLocIndicesReq>;

export type IApiQueryLocIndicesRes = IExternalApiRes<TApiLocIndexProps>;

export type IApiQueryZensusAtlasRes = IExternalApiRes<TProcessedCensusData>;

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
  language?: Language;
  apiType?: ApiAddrInRangeApiTypesEnum;
}

export interface IApiFetchAddrInRangeReqStatus
  extends IExternalApiReqStatus<IApiFetchAddrInRangeReq> {
  sourceAddress?: string;
  returnedAddressesNumber?: number;
  apiType?: ApiAddrInRangeApiTypesEnum;
  apiRequestsNumber?: number;
}

export type IApiFetchAddrInRangeRes = IExternalApiRes<{
  addresses_number: number;
  addresses: IApiAddressInRange[];
}>;

export interface IApiFetchPoiDataReq extends IApiCoordinatesOrAddress {
  poiNumber?: number;
  transportMode?: MeansOfTransportation;
  distance?: number;
  unit?: ApiUnitsOfTransportEnum;
}

export type IApiFetchPoiDataReqStatus =
  IExternalApiReqStatus<IApiFetchPoiDataReq>;

export type IApiFetchPoiDataRes = IExternalApiRes<ApiOsmLocation[]>;

export interface IOpenAiExtQueryReq extends IApiFetchPoiDataReq {
  language?: ApiBcp47LanguageEnum;
  maxTextLength?: number;
  queryType?: ApiOpenAiQueryTypesEnum;
  tonality?: OpenAiTonalityEnum;

  energyEfficiency?: ApiEnergyEfficiency;
  furnishing?: ApiFurnishing[];
  livingAreaInSqM?: number;
  price?: number;
  priceType?: ApiRealEstateCostType;
  totalAreaInSqM?: number;
  customText?: string;
}

export type IApiOpenAiExtQueryReqStatus =
  IExternalApiReqStatus<IOpenAiExtQueryReq>;

export type IOpenAiExtQueryRes = IExternalApiRes<string>;

export interface IApiFetchSnapshotDataReq extends IApiFetchPoiDataReq {
  isAddressShown?: boolean;
  markerColor?: string;
  poiTypes?: OsmName[];
  publicationId?: string;
  responseType?: SnapshotDataTypesEnum;
  snapshotId?: string;
  templateSnapshotId?: string;
}

export type IApiFetchSnapshotDataReqStatus =
  IExternalApiReqStatus<IApiFetchSnapshotDataReq>;

export interface IApiFetchSnapshotDataRes extends IExternalApiRes<string> {
  snapshotId: string;
}

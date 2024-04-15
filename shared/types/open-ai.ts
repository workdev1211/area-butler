import { MeansOfTransportation } from "./types";

export enum OpenAiTonalityEnum {
  FORMAL_SERIOUS = "FORMAL_SERIOUS",
  EASYGOING_YOUTHFUL = "EASYGOING_YOUTHFUL",
}

export enum OpenAiCustomTextEnum {
  POPULATION = "POPULATION",
  SEO = "SEO",
  REGION = "REGION",
  POIS = "POIS",
  OFFICE = "OFFICE",
  COMMERCIAL = "COMMERCIAL",
  RESIDENTIAL = "RESIDENTIAL",
  TEASER = "TEASER",
  CUSTOM = "CUSTOM",
  NONE = "NONE",
}

export interface IOpenAiGeneralFormValues {
  tonality?: OpenAiTonalityEnum;
  targetGroupName?: string;
  customText?: string;
  textLength?: OpenAiTextLengthEnum;
}

export interface IOpenAiLocDescFormValues extends IOpenAiGeneralFormValues {
  meanOfTransportation: MeansOfTransportation;
}

export interface IApiOpenAiLocDescQuery extends IOpenAiLocDescFormValues {
  snapshotId: string;
  isForOnePage?: boolean;
}

export interface IApiOpenAiRealEstDescQuery extends IOpenAiGeneralFormValues {
  realEstateId: string;
  realEstateType: string;
}

export interface IApiOpenAiLocRealEstDescQuery
  extends IOpenAiLocDescFormValues,
    IApiOpenAiRealEstDescQuery {
  snapshotId: string;
}

export interface IApiOpenAiResponseLimit {
  quantity: number;
  type: ApiOpenAiRespLimitTypesEnum;
}

export enum OpenAiQueryTypeEnum {
  LOCATION_REAL_ESTATE_DESCRIPTION = "LOCATION_REAL_ESTATE_DESCRIPTION",
  REAL_ESTATE_DESCRIPTION = "REAL_ESTATE_DESCRIPTION",
  LOCATION_DESCRIPTION = "LOCATION_DESCRIPTION",
  FORMAL_TO_INFORMAL = "FORMAL_TO_INFORMAL",
  GENERAL_QUESTION = "GENERAL_QUESTION",
}

export enum OpenAiOsmQueryNameEnum {
  PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT",
  HIGHWAY_ACCESS = "HIGHWAY_ACCESS",
  CHARGING_STATIONS = "CHARGING_STATIONS",
  GAS_STATIONS = "GAS_STATIONS",
  SUPERMARKETS_AND_DRUGSTORES = "SUPERMARKETS_AND_DRUGSTORES",
  SCHOOLS_AND_KINDERGARDEN = "SCHOOLS_AND_KINDERGARDEN",
  UNIVERSITIES = "UNIVERSITIES",
  PLAYGROUNDS_AND_PARKS = "PLAYGROUNDS_AND_PARKS",
  BARS_AND_RESTAURANTS = "BARS_AND_RESTAURANTS",
  THEATERS = "THEATERS",
  SPORTS = "SPORTS",
  SWIMMING_POOLS = "SWIMMING_POOLS",
  DOCTORS = "DOCTORS",
  PHARMACIES = "PHARMACIES",
  HOSPITALS = "HOSPITALS",
  SIGHTS = "SIGHTS",
}

export interface IApiOpenAiQuery {
  text: string;
  isFormalToInformal?: boolean;
  integrationId?: string;
}

export enum ApiOpenAiRespLimitTypesEnum {
  CHARACTER = "CHARACTER",
  WORD = "WORD",
}

export enum OpenAiRealEstTypesEnum {
  ROOM = "ROOM",
  HOUSE = "HOUSE",
  APARTMENT = "APARTMENT",
  PROPERTY = "PROPERTY",
  OFFICE_PRACTICES = "OFFICE_PRACTICES",
  STORE_RETAIL = "STORE_RETAIL",
  HOSPITALITY = "HOSPITALITY",
  HALLS_WAREHOUSE_PRODUCTION = "HALLS_WAREHOUSE_PRODUCTION",
  AGRICULTURE_FORESTRY = "AGRICULTURE_FORESTRY",
  LEISURE_COMMERCIAL = "LEISURE_COMMERCIAL",
  OTHER = "OTHER",
  CUSTOM = "CUSTOM",
}

export enum OpenAiTextLengthEnum {
  SHORT = "SHORT",
  MEDIUM = "MEDIUM",
  LONG = "LONG",
}

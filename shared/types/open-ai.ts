import { ISelectTextValue, MeansOfTransportation } from "./types";

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
  CUSTOM = "CUSTOM",
  NONE = "NONE",
}

export interface IOpenAiLocationDescriptionFormValues {
  meanOfTransportation: MeansOfTransportation;
  tonality: OpenAiTonalityEnum;
  customText?: ISelectTextValue;
}

export interface IApiOpenAiLocationDescriptionQuery
  extends IOpenAiLocationDescriptionFormValues {
  searchResultSnapshotId: string;
  realEstateListingId?: string;
  responseLimit?: IApiOpenAiResponseLimit;
}

export interface IApiOpenAiRealEstateDescriptionQuery {
  realEstateListingId: string;
  responseLimit?: IApiOpenAiResponseLimit;
}

export interface IApiOpenAiLocationRealEstateDescriptionQuery
  extends IOpenAiLocationDescriptionFormValues,
    IApiOpenAiRealEstateDescriptionQuery {
  searchResultSnapshotId: string;
  responseLimit?: IApiOpenAiResponseLimit;
}

export interface IApiOpenAiResponseLimit {
  quantity: number;
  type: ApiOpenAiResponseLimitTypesEnum;
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
  realEstateListingId?: string;
  integrationId?: string;
}

export enum ApiOpenAiResponseLimitTypesEnum {
  CHARACTER = "CHARACTER",
  WORD = "WORD",
}

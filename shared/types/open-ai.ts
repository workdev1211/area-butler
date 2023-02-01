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
  CUSTOM = "CUSTOM",
  NONE = "NONE",
}

export interface IOpenAiLocationDescriptionFormValues {
  meanOfTransportation: MeansOfTransportation;
  tonality: OpenAiTonalityEnum;
  customText?: string | undefined;
}

export interface IApiOpenAiLocationDescriptionQuery
  extends IOpenAiLocationDescriptionFormValues {
  searchResultSnapshotId: string;
}

export interface IOpenAiRealEstateDescriptionFormValues {
  realEstateListingId: string | undefined;
}

export enum OpenAiQueryTypeEnum {
  "LOCATION_DESCRIPTION" = "LOCATION_DESCRIPTION",
  "REAL_ESTATE_DESCRIPTION" = "REAL_ESTATE_DESCRIPTION",
  "LOCATION_ESTATE_DESCRIPTION" = "LOCATION_ESTATE_DESCRIPTION",
  "FORMAL_TO_INFORMAL" = "FORMAL_TO_INFORMAL",
  "GENERAL_QUESTION" = "GENERAL_QUESTION",
}

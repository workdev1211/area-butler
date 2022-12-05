import { MeansOfTransportation } from "./types";

export enum OpenAiTonalityEnum {
  FORMAL_SERIOUS = "FORMAL_SERIOUS",
  EASYGOING_YOUTHFUL = "EASYGOING_YOUTHFUL",
}

// TODO remove in future
// export enum OpenAiTextLengthEnum {
//   SHORT = "SHORT",
//   MEDIUM = "MEDIUM",
//   LONG = "LONG",
// }

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

export interface IApiAiDescriptionQuery {
  searchResultSnapshotId: string;
  meanOfTransportation: MeansOfTransportation;
  tonality: OpenAiTonalityEnum;
  // TODO remove in future
  // textLength: OpenAiTextLengthEnum;
  customText?: string;
}

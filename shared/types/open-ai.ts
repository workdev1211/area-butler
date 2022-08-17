import { MeansOfTransportation } from "./types";

export enum OpenAiTonalityEnum {
  FORMAL_SERIOUS = "FORMAL_SERIOUS",
  EASYGOING_YOUTHFUL = "EASYGOING_YOUTHFUL",
}

export interface IOpenAiTextCompletionParams {
  searchResultSnapshotId: string;
  meanOfTransportation: MeansOfTransportation;
  tonality: OpenAiTonalityEnum;
}

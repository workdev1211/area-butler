import { OpenAiQueryTypeEnum, TOpenAiLocDescType } from "../../types/open-ai";
import { AreaButlerExportTypesEnum } from "../../types/types";

export const onOfficeOpenAiFieldMapper: Record<TOpenAiLocDescType, string> = {
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: "lage",
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: "objektbeschreibung",
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: "sonstige_angaben",
};

export const onOfficeLinkFieldMapper: Record<
  | AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
  | AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
  string
> = {
  [AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]: "MPAreaButlerUrlWithAddress",
  [AreaButlerExportTypesEnum.LINK_WO_ADDRESS]: "MPAreaButlerUrlNoAddress",
};

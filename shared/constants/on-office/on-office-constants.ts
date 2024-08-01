import { OpenAiQueryTypeEnum, TOpenAiLocDescType } from "../../types/open-ai";
import { AreaButlerExportTypesEnum } from "../../types/types";
import { getBidirectionalMapping } from "../../functions/shared.functions";
import { OnOfficeOpenAiFieldEnum } from "../../types/on-office";

const onOfficeToOpenAiFieldMapper: Map<
  TOpenAiLocDescType,
  OnOfficeOpenAiFieldEnum
> = new Map([
  // Lage
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION, OnOfficeOpenAiFieldEnum.LOCATION],
  // Sonstige Angaben
  [
    OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    OnOfficeOpenAiFieldEnum.OTHER_INFO,
  ],
  // Beschreibung
  [
    OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    OnOfficeOpenAiFieldEnum.PROP_DESCRIPTION,
  ],
]);

export const onOfficeOpenAiFieldMapper = getBidirectionalMapping(
  onOfficeToOpenAiFieldMapper
);

export const onOfficeLinkFieldMapper: Record<
  | AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
  | AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
  string
> = {
  [AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]: "MPAreaButlerUrlWithAddress",
  [AreaButlerExportTypesEnum.LINK_WO_ADDRESS]: "MPAreaButlerUrlNoAddress",
};

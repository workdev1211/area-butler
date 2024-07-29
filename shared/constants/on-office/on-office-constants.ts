import { OpenAiQueryTypeEnum, TOpenAiLocDescType } from "../../types/open-ai";

export const openAiQueryTypeToOnOfficeEstateFieldMapping: Record<
  TOpenAiLocDescType,
  string
> = {
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: "lage",
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: "objektbeschreibung",
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: "sonstige_angaben",
};

export const onOfficeUrlFieldsMapper = {
  WITH_ADDRESS: "MPAreaButlerUrlWithAddress",
  WITHOUT_ADDRESS: "MPAreaButlerUrlNoAddress",
};

import { OpenAiQueryTypeEnum } from "../../types/open-ai";

export const openAiQueryTypeToOnOfficeEstateFieldMapping: Partial<
  Record<OpenAiQueryTypeEnum, string>
> = {
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: "lage",
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: "objektbeschreibung",
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: "sonstige_angaben",
};

export const onOfficeOpenAiCharacterLimit = 2000;
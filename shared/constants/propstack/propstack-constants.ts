import { OpenAiQueryTypeEnum, TOpenAiLocDescType } from "../../types/open-ai";
import {
  PropstackPropMarketTypesEnum,
  PropstackTextFieldTypeEnum,
} from "../../types/propstack";
import { getBidirectionalMapping } from "../../functions/shared.functions";
import { AreaButlerExportTypesEnum } from "../../types/types";

export const propstackConnectRoutePath: string = "/api/propstack/connect";
export const propstackWebhookIntRoutePaths: string[] = [
  "/api/propstack-webhook-int/property-created",
  "/api/propstack-webhook-int/property-updated",
];

export const propstackLoginRoutePath: string = "/api/propstack/login";

export const propstackPropertyMarketTypeNames: {
  text: string;
  value: PropstackPropMarketTypesEnum;
}[] = [
  {
    text: "Kauf",
    value: PropstackPropMarketTypesEnum.BUY,
  },
  {
    text: "Miete",
    value: PropstackPropMarketTypesEnum.RENT,
  },
];

export const propstackLinkFieldMapper: Record<
  | AreaButlerExportTypesEnum.LINK_WITH_ADDRESS
  | AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
  string
> = {
  [AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]: "areabutler_link_with_address",
  [AreaButlerExportTypesEnum.LINK_WO_ADDRESS]:
    "areabutler_link_without_address",
};

const propstackToOpenAiFieldMapper: Map<
  PropstackTextFieldTypeEnum,
  TOpenAiLocDescType
> = new Map([
  [
    PropstackTextFieldTypeEnum.LOCATION_NOTE,
    OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
  ],
  [
    PropstackTextFieldTypeEnum.OTHER_NOTE,
    OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
  ],
  [
    PropstackTextFieldTypeEnum.DESCRIPTION_NOTE,
    OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
  ],
  [
    PropstackTextFieldTypeEnum.FURNISHING_NOTE,
    OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
  ],
]);

export const propstackOpenAiFieldMapper = getBidirectionalMapping(
  propstackToOpenAiFieldMapper
);

import { OpenAiQueryTypeEnum } from "../types/open-ai";
import { PropstackPropMarketTypesEnum } from "../types/propstack";

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

export const propstackExportTypeMapping: Partial<
  Record<OpenAiQueryTypeEnum, string>
> = {
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: "location_note",
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: "description_note",
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: "other_note",
};

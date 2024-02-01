import { PropstackRealEstMarketTypesEnum } from "../types/propstack";
import { OpenAiQueryTypeEnum } from "../types/open-ai";

export const propstackConnectRoutePath: string = "/api/propstack/connect";
export const propstackWebhookIntRoutePaths: string[] = [
  "/api/propstack-webhook-int/property-created",
  "/api/propstack-webhook-int/property-updated",
];

export const propstackLoginRoutePath: string = "/api/propstack/login";

export const propstackRealEstMarketTypeNames: {
  text: string;
  value: PropstackRealEstMarketTypesEnum;
}[] = [
  {
    text: "Kauf",
    value: PropstackRealEstMarketTypesEnum.BUY,
  },
  {
    text: "Miete",
    value: PropstackRealEstMarketTypesEnum.RENT,
  },
];

export const propstackExportTypeMapping: Partial<
  Record<OpenAiQueryTypeEnum, string>
> = {
  [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: "location_note",
  [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: "description_note",
  [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: "other_note",
};

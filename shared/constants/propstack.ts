import { PropstackRealEstMarketTypesEnum } from "../types/propstack";

export const propstackConnectRoutePath: string = "/api/propstack/connect";
export const propstackWebhookIntRoutePaths: string[] = [
  "/api/propstack-webhook-int/property-created",
];

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

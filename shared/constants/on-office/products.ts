import {
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../types/on-office";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../types/integration-user";

export const openAiOnOfficeProduct: IOnOfficeProduct = {
  name: "P1: Lagepläne & KI-Texte",
  type: OnOfficeProductTypesEnum.OPEN_AI,
  price: 9,
};

export const openAi10OnOfficeProduct: IOnOfficeProduct = {
  name: "P1: Lagepläne & KI-Texte x10",
  type: OnOfficeProductTypesEnum.OPEN_AI_10,
  price: 69,
};

export const statsExportOnOfficeProduct: IOnOfficeProduct = {
  name: "P2: Alle Funktionen",
  type: OnOfficeProductTypesEnum.STATS_EXPORT,
  price: 39,
};

export const statsExport10OnOfficeProduct: IOnOfficeProduct = {
  name: "P2: Alle Funktionen x10",
  type: OnOfficeProductTypesEnum.STATS_EXPORT_10,
  price: 290,
};

export const subscriptionOnOfficeProduct: IOnOfficeProduct = {
  name: "Jahrespaket",
  type: OnOfficeProductTypesEnum.SUBSCRIPTION,
  price: 0,
};

export const allOnOfficeProducts: Record<
  OnOfficeProductTypesEnum,
  IOnOfficeProduct
> = {
  [OnOfficeProductTypesEnum.OPEN_AI]: openAiOnOfficeProduct,
  [OnOfficeProductTypesEnum.OPEN_AI_10]: openAi10OnOfficeProduct,
  [OnOfficeProductTypesEnum.STATS_EXPORT]: statsExportOnOfficeProduct,
  [OnOfficeProductTypesEnum.STATS_EXPORT_10]: statsExport10OnOfficeProduct,
  [OnOfficeProductTypesEnum.SUBSCRIPTION]: subscriptionOnOfficeProduct,
};

export const legacyOnOfficeProdNames: Record<
  | ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME
  | ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE,
  string
> = {
  [ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME]:
    "Erbe P3: Interaktive Karten",
  [ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE]: "Erbe P4: Lage-Exposé",
};

export const statsExportUnlockText = "Alle Funktionen freischalten?";

export const initOpenAiReqQuantity = 100;

import {
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../types/on-office";

export const mapSnapshotOnOfficeProduct: IOnOfficeProduct = {
  name: "P1: Lagepläne",
  type: OnOfficeProductTypesEnum.MAP_SNAPSHOT,
  price: 0,
};

export const openAiOnOfficeProduct: IOnOfficeProduct = {
  name: "P2: KI-Texte",
  type: OnOfficeProductTypesEnum.OPEN_AI,
  price: 0.99,
};

export const openAi10OnOfficeProduct: IOnOfficeProduct = {
  name: "P2: KI-Texte x10",
  type: OnOfficeProductTypesEnum.OPEN_AI_10,
  price: 8.91,
};

export const mapIframeOnOfficeProduct: IOnOfficeProduct = {
  name: "P3: Interaktive Karten",
  type: OnOfficeProductTypesEnum.MAP_IFRAME,
  price: 7.99,
};

export const mapIframe10OnOfficeProduct: IOnOfficeProduct = {
  name: "P3: Interaktive Karten x10",
  type: OnOfficeProductTypesEnum.MAP_IFRAME_10,
  price: 71.91,
};

export const onePageOnOfficeProduct: IOnOfficeProduct = {
  name: "P4: Lage-Exposé",
  type: OnOfficeProductTypesEnum.ONE_PAGE,
  price: 9.99,
};

export const onePage10OnOfficeProduct: IOnOfficeProduct = {
  name: "P4: Lage-Exposé x10",
  type: OnOfficeProductTypesEnum.ONE_PAGE_10,
  price: 89.91,
};

export const statsExportOnOfficeProduct: IOnOfficeProduct = {
  name: "P5: Alle Features",
  type: OnOfficeProductTypesEnum.STATS_EXPORT,
  price: 39,
};

export const statsExport10OnOfficeProduct: IOnOfficeProduct = {
  name: "P5: Alle Features x10",
  type: OnOfficeProductTypesEnum.STATS_EXPORT_10,
  price: 290,
};

export const subscriptionOnOfficeProduct: IOnOfficeProduct = {
  name: "Bald: Vorteilsabo",
  type: OnOfficeProductTypesEnum.SUBSCRIPTION,
  price: 0,
};

export const allOnOfficeProducts: Record<
  OnOfficeProductTypesEnum,
  IOnOfficeProduct
> = {
  [OnOfficeProductTypesEnum.MAP_SNAPSHOT]: mapSnapshotOnOfficeProduct,
  [OnOfficeProductTypesEnum.OPEN_AI]: openAiOnOfficeProduct,
  [OnOfficeProductTypesEnum.OPEN_AI_10]: openAi10OnOfficeProduct,
  [OnOfficeProductTypesEnum.MAP_IFRAME]: mapIframeOnOfficeProduct,
  [OnOfficeProductTypesEnum.MAP_IFRAME_10]: mapIframe10OnOfficeProduct,
  [OnOfficeProductTypesEnum.ONE_PAGE]: onePageOnOfficeProduct,
  [OnOfficeProductTypesEnum.ONE_PAGE_10]: onePage10OnOfficeProduct,
  [OnOfficeProductTypesEnum.STATS_EXPORT]: statsExportOnOfficeProduct,
  [OnOfficeProductTypesEnum.STATS_EXPORT_10]: statsExport10OnOfficeProduct,
  [OnOfficeProductTypesEnum.SUBSCRIPTION]: subscriptionOnOfficeProduct,
};

export const statsExportUnlockText = "Alle Funktionen freischalten?";

export const initOpenAiReqQuantity = 100;

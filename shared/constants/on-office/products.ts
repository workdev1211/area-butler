import {
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../types/on-office";

export const mapSnapshotOnOfficeProduct: IOnOfficeProduct = {
  name: "Lagepläne und Distanzen",
  type: OnOfficeProductTypesEnum.MAP_SNAPSHOT,
  price: 0,
};

export const openAiOnOfficeProduct: IOnOfficeProduct = {
  name: "KI-Assistent",
  type: OnOfficeProductTypesEnum.OPEN_AI,
  price: 0.99,
};

export const openAi50OnOfficeProduct: IOnOfficeProduct = {
  name: "KI-Assistent x50",
  type: OnOfficeProductTypesEnum.OPEN_AI_50,
  price: 32.48,
};

export const mapIframeOnOfficeProduct: IOnOfficeProduct = {
  name: "Interaktive Karten Paket",
  type: OnOfficeProductTypesEnum.MAP_IFRAME,
  price: 7.99,
};

export const mapIframe50OnOfficeProduct: IOnOfficeProduct = {
  name: "Interaktive Karten Paket x50",
  type: OnOfficeProductTypesEnum.MAP_IFRAME_50,
  price: 262.11,
};

export const onePageOnOfficeProduct: IOnOfficeProduct = {
  name: "Automatisches Lage-Exposé",
  type: OnOfficeProductTypesEnum.ONE_PAGE,
  price: 9.99,
  isDisabled: true,
};

export const onePage50OnOfficeProduct: IOnOfficeProduct = {
  name: "Automatisches Lage-Exposé x50",
  type: OnOfficeProductTypesEnum.ONE_PAGE_50,
  price: 327.72,
  isDisabled: true,
};

export const allOnOfficeProducts: Record<
  OnOfficeProductTypesEnum,
  IOnOfficeProduct
> = {
  [OnOfficeProductTypesEnum.MAP_SNAPSHOT]: mapSnapshotOnOfficeProduct,
  [OnOfficeProductTypesEnum.OPEN_AI]: openAiOnOfficeProduct,
  [OnOfficeProductTypesEnum.OPEN_AI_50]: openAi50OnOfficeProduct,
  [OnOfficeProductTypesEnum.MAP_IFRAME]: mapIframeOnOfficeProduct,
  [OnOfficeProductTypesEnum.MAP_IFRAME_50]: mapIframe50OnOfficeProduct,
  [OnOfficeProductTypesEnum.ONE_PAGE]: onePageOnOfficeProduct,
  [OnOfficeProductTypesEnum.ONE_PAGE_50]: onePage50OnOfficeProduct,
};

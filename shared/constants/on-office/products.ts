import {
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../types/on-office";

export const mapSnapshotOnOfficeProduct: IOnOfficeProduct = {
  title: "Map Snapshot",
  description: "Map Snapshot Description",
  type: OnOfficeProductTypesEnum.MAP_SNAPSHOT,
  price: 0,
};

export const openAiOnOfficeProduct: IOnOfficeProduct = {
  title: "OpenAI",
  description: "OpenAI Description",
  type: OnOfficeProductTypesEnum.OPEN_AI,
  price: 6.99,
};

export const openAi50OnOfficeProduct: IOnOfficeProduct = {
  title: "OpenAI x50",
  description: "OpenAI x50 Description",
  type: OnOfficeProductTypesEnum.OPEN_AI_50,
  price: 229.31,
};

export const mapIframeOnOfficeProduct: IOnOfficeProduct = {
  title: "Map with iFrame",
  description: "Map with iFrame Description",
  type: OnOfficeProductTypesEnum.MAP_IFRAME,
  price: 9.99,
};

export const mapIframe50OnOfficeProduct: IOnOfficeProduct = {
  title: "Map with iFrame x50",
  description: "Map with iFrame x50 Description",
  type: OnOfficeProductTypesEnum.MAP_IFRAME_50,
  price: 327.72,
};

export const onePageOnOfficeProduct: IOnOfficeProduct = {
  title: "One Page",
  description: "One Page Description",
  type: OnOfficeProductTypesEnum.ONE_PAGE,
  price: 13.99,
};

export const onePage50OnOfficeProduct: IOnOfficeProduct = {
  title: "One Page x50",
  description: "One Page x50 Description",
  type: OnOfficeProductTypesEnum.ONE_PAGE_50,
  price: 458.94,
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

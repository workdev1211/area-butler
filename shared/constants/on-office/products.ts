import {
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../types/on-office";
import { PaymentSystemTypeEnum } from "../../types/subscription-plan";

export const mapSnapshotOnOfficeProduct: IOnOfficeProduct = {
  title: "Map Snapshot",
  description: "Map Snapshot Description",
  type: OnOfficeProductTypesEnum.MAP_SNAPSHOT,
  price: 0,
  priceIds: {
    dev: { [PaymentSystemTypeEnum.STRIPE]: "price_1MeLAnLcbb2Q3qBpn5I9hpRa" },
    prod: { [PaymentSystemTypeEnum.STRIPE]: "b1-1" },
  },
};

export const openAiOnOfficeProduct: IOnOfficeProduct = {
  title: "OpenAI",
  description: "OpenAI Description",
  type: OnOfficeProductTypesEnum.OPEN_AI,
  price: 6.99,
  priceIds: {
    dev: { [PaymentSystemTypeEnum.STRIPE]: "price_1MeKNnLcbb2Q3qBpSxuKMNMv" },
    prod: { [PaymentSystemTypeEnum.STRIPE]: "b2-1" },
  },
};

export const openAi50OnOfficeProduct: IOnOfficeProduct = {
  title: "OpenAI x50",
  description: "OpenAI x50 Description",
  type: OnOfficeProductTypesEnum.OPEN_AI_50,
  price: 229.31,
  priceIds: {
    dev: { [PaymentSystemTypeEnum.STRIPE]: "a2-2" },
    prod: { [PaymentSystemTypeEnum.STRIPE]: "b2-2" },
  },
};

export const mapIframeOnOfficeProduct: IOnOfficeProduct = {
  title: "Map with iFrame",
  description: "Map with iFrame Description",
  type: OnOfficeProductTypesEnum.MAP_IFRAME,
  price: 9.99,
  priceIds: {
    dev: { [PaymentSystemTypeEnum.STRIPE]: "price_1MeLBILcbb2Q3qBpZx0Gsmte" },
    prod: { [PaymentSystemTypeEnum.STRIPE]: "b3-1" },
  },
};

export const mapIframe50OnOfficeProduct: IOnOfficeProduct = {
  title: "Map with iFrame x50",
  description: "Map with iFrame x50 Description",
  type: OnOfficeProductTypesEnum.MAP_IFRAME_50,
  price: 327.72,
  priceIds: {
    dev: { [PaymentSystemTypeEnum.STRIPE]: "a3-2" },
    prod: { [PaymentSystemTypeEnum.STRIPE]: "b3-2" },
  },
};

export const onePageOnOfficeProduct: IOnOfficeProduct = {
  title: "One Page",
  description: "One Page Description",
  type: OnOfficeProductTypesEnum.ONE_PAGE,
  price: 13.99,
  priceIds: {
    dev: { [PaymentSystemTypeEnum.STRIPE]: "price_1MeLBiLcbb2Q3qBpdrpiQDik" },
    prod: { [PaymentSystemTypeEnum.STRIPE]: "b4-1" },
  },
};

export const onePage50OnOfficeProduct: IOnOfficeProduct = {
  title: "One Page x50",
  description: "One Page x50 Description",
  type: OnOfficeProductTypesEnum.ONE_PAGE_50,
  price: 458.94,
  priceIds: {
    dev: { [PaymentSystemTypeEnum.STRIPE]: "a4-2" },
    prod: { [PaymentSystemTypeEnum.STRIPE]: "b4-2" },
  },
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

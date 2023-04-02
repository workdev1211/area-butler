import {
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../types/on-office";

export const mapSnapshotOnOfficeProduct: IOnOfficeProduct = {
  type: OnOfficeProductTypesEnum.MAP_SNAPSHOT,
  price: 0,
};

export const openAiOnOfficeProduct: IOnOfficeProduct = {
  type: OnOfficeProductTypesEnum.OPEN_AI,
  price: 2.99,
};

export const openAi50OnOfficeProduct: IOnOfficeProduct = {
  type: OnOfficeProductTypesEnum.OPEN_AI_50,
  price: 98.09,
};

export const mapIframeOnOfficeProduct: IOnOfficeProduct = {
  type: OnOfficeProductTypesEnum.MAP_IFRAME,
  price: 7.99,
};

export const mapIframe50OnOfficeProduct: IOnOfficeProduct = {
  type: OnOfficeProductTypesEnum.MAP_IFRAME_50,
  price: 262.11,
};

export const onePageOnOfficeProduct: IOnOfficeProduct = {
  type: OnOfficeProductTypesEnum.ONE_PAGE,
  price: 9.99,
  isDisabled: true,
};

export const onePage50OnOfficeProduct: IOnOfficeProduct = {
  type: OnOfficeProductTypesEnum.ONE_PAGE_50,
  price: 327.72,
  isDisabled: true,
};

export const allOnOfficeProducts: Partial<
  Record<OnOfficeProductTypesEnum, IOnOfficeProduct>
> = {
  [OnOfficeProductTypesEnum.MAP_SNAPSHOT]: mapSnapshotOnOfficeProduct,
  [OnOfficeProductTypesEnum.OPEN_AI]: openAiOnOfficeProduct,
  [OnOfficeProductTypesEnum.OPEN_AI_50]: openAi50OnOfficeProduct,
  [OnOfficeProductTypesEnum.MAP_IFRAME]: mapIframeOnOfficeProduct,
  [OnOfficeProductTypesEnum.MAP_IFRAME_50]: mapIframe50OnOfficeProduct,
  [OnOfficeProductTypesEnum.ONE_PAGE]: onePageOnOfficeProduct,
  [OnOfficeProductTypesEnum.ONE_PAGE_50]: onePage50OnOfficeProduct,
};

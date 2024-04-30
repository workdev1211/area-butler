import {
  ApiIntUserOnOfficeProdContTypesEnum,
  ApiIntUserPropstackProdContTypesEnum,
  TApiIntUserProdContType,
} from "../../../shared/types/integration-user";
import {
  allOnOfficeProducts,
  legacyOnOfficeProdNames,
} from "../../../shared/constants/on-office/on-office-products";
import flatRateImage from "../assets/icons/onoffice-products/subscription.png";
import statsExportImage from "../assets/icons/onoffice-products/full-package.png";
import openAiImage from "../assets/icons/onoffice-products/open-ai.png";
import { OnOfficeProductTypesEnum } from "../../../shared/types/on-office";
import { TIntegrationProductType } from "../../../shared/types/integration";
import { PropstackProductTypeEnum } from "../../../shared/types/propstack";

export const getProductNameByType = (
  productType: TApiIntUserProdContType
): string => {
  switch (productType) {
    case ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI:
    case ApiIntUserPropstackProdContTypesEnum.OPEN_AI: {
      return allOnOfficeProducts[ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI]
        .name;
    }

    case ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME: {
      return legacyOnOfficeProdNames[
        ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME
      ];
    }

    case ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE: {
      return legacyOnOfficeProdNames[
        ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE
      ];
    }

    case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT:
    case ApiIntUserPropstackProdContTypesEnum.STATS_EXPORT: {
      return allOnOfficeProducts[
        ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT
      ].name;
    }

    default: {
      const msg = `Product with type ${productType} not found!`;
      console.error(msg);
      throw new Error(msg);
    }
  }
};

export const getProductImage = (
  productType: TIntegrationProductType
): string => {
  switch (productType) {
    case OnOfficeProductTypesEnum.OPEN_AI:
    case PropstackProductTypeEnum.OPEN_AI: {
      return openAiImage;
    }
    case OnOfficeProductTypesEnum.STATS_EXPORT:
    case PropstackProductTypeEnum.STATS_EXPORT: {
      return statsExportImage;
    }
    case OnOfficeProductTypesEnum.FLAT_RATE:
    case PropstackProductTypeEnum.FLAT_RATE: {
      return flatRateImage;
    }
    default: {
      const msg = `Product with type ${productType} not found!`;
      console.error(msg);
      throw new Error(msg);
    }
  }
};

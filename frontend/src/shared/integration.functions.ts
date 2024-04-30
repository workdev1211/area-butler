import {
  ApiIntUserOnOfficeProdContTypesEnum,
  TApiIntUserProdContType,
} from "../../../shared/types/integration-user";
import {
  allOnOfficeProducts,
  legacyOnOfficeProdNames,
} from "../../../shared/constants/on-office/on-office-products";

// TODO think about moving to the product description component
export const getProductNameByType = (
  productType: TApiIntUserProdContType
): string => {
  switch (productType) {
    case ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI: {
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

    case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT: {
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

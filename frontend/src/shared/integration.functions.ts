import {
  ApiIntUserOnOfficeProdContTypesEnum,
  TApiIntUserProdContTypes,
} from "../../../shared/types/integration-user";
import { allOnOfficeProducts } from "../../../shared/constants/on-office/products";

// TODO think about moving to the product description component
export const getProductNameByType = (
  productType: TApiIntUserProdContTypes
): string => {
  switch (productType) {
    case ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI: {
      return allOnOfficeProducts[ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI]
        .name;
    }

    case ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME: {
      return allOnOfficeProducts[ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME]
        .name;
    }

    case ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE: {
      return allOnOfficeProducts[ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE]
        .name;
    }

    case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT: {
      return allOnOfficeProducts[
        ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT
      ].name;
    }

    case ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT:
    default: {
      return allOnOfficeProducts[
        ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT
      ].name;
    }
  }
};

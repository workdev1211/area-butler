import {
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from "../../../shared/types/integration";
import { getProdContTypeByActType } from "../../../shared/functions/integration.functions";
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  TApiIntUserAvailProdContingents,
  TApiIntUserAvailProdContTypes,
} from "../../../shared/types/integration-user";
import { allOnOfficeProducts } from "../../../shared/constants/on-office/products";

export const checkProdContAvailability = (
  integrationType: IntegrationTypesEnum,
  actionType: TIntegrationActionTypes,
  availProdContingents?: TApiIntUserAvailProdContingents
) => {
  if (!availProdContingents) {
    return false;
  }

  const productContingentType = getProdContTypeByActType(
    integrationType,
    actionType
  );

  return !!availProdContingents[productContingentType];
};

export const getProductNameByType = (
  productType: TApiIntUserAvailProdContTypes
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

    case ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT:
    default: {
      return allOnOfficeProducts[
        ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT
      ].name;
    }
  }
};

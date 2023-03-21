import {
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from "../../../shared/types/integration";
import { getProdContTypeByActType } from "../../../shared/functions/integration.functions";
import { TApiIntUserAvailProdContingents } from "../../../shared/types/integration-user";

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

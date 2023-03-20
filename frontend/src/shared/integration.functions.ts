import { TIntegrationActionTypes } from "../../../shared/types/integration";
import { getProdContTypeByActType } from "../../../shared/functions/integration.functions";
import { TIntegrationUser } from "../context/UserContext";

export const checkProdContAvailability = (
  { integrationType, availProdContingents }: TIntegrationUser,
  actionType: TIntegrationActionTypes
) => {
  const productContingentType = getProdContTypeByActType(
    integrationType,
    actionType
  );

  return !!availProdContingents[productContingentType];
};

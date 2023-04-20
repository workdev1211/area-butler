import { useContext } from "react";
import { useHistory } from "react-router-dom";

import { ConfigContext } from "../context/ConfigContext";
import { UserContext } from "../context/UserContext";
import { checkProdContAvailability } from "../shared/integration.functions";
import { toastError } from "../shared/shared.functions";
import { TIntegrationActionTypes } from "../../../shared/types/integration";

export const useIntegrationTools = () => {
  const { integrationType } = useContext(ConfigContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const history = useHistory();

  // should be handled via the true response to avoid race condition
  const checkProdContAvailByAction = (
    actionType: TIntegrationActionTypes,
    additionalCondition = true
  ): boolean => {
    if (
      integrationType &&
      actionType &&
      additionalCondition &&
      !checkProdContAvailability(
        integrationType!,
        actionType,
        integrationUser!.availProdContingents
      )
    ) {
      toastError("Bitte kaufen Sie ein entsprechendes Produkt!", () => {
        history.push("/products");
      });

      return false;
    }

    return true;
  };

  return { checkProdContAvailByAction };
};

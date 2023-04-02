import { useContext } from "react";
import { useHistory } from "react-router-dom";

import { ConfigContext } from "../context/ConfigContext";
import { UserContext } from "../context/UserContext";
import { checkProdContAvailability } from "../shared/integration.functions";
import { OnOfficeIntActTypesEnum } from "../../../shared/types/on-office";
import { toastError } from "../shared/shared.functions";

export const useIntegrationTools = () => {
  const { integrationType } = useContext(ConfigContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const history = useHistory();

  // TODO think about the concept of this approach
  const sendToProductsIfNoContingent = (): boolean => {
    if (
      !checkProdContAvailability(
        integrationType!,
        OnOfficeIntActTypesEnum.UNLOCK_IFRAME,
        integrationUser!.availProdContingents
      )
    ) {
      toastError("Bitte kaufen Sie ein entsprechendes Produkt!", () => {
        history.push("/products");
      });

      return true;
    }

    return false;
  };

  return { sendToProductsIfNoContingent };
};

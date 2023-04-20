import { useContext } from "react";
import { useHistory } from "react-router-dom";

import { ConfigContext } from "../context/ConfigContext";
import { UserContext } from "../context/UserContext";
import { checkProdContAvailability } from "../shared/integration.functions";
import { toastError, toastSuccess } from "../shared/shared.functions";
import { TIntegrationActionTypes } from "../../../shared/types/integration";
import { IApiOnOfficeUploadFileReq } from "../../../shared/types/on-office";
import { useHttp } from "./http";
import { SearchContext } from "../context/SearchContext";

export const useIntegrationTools = () => {
  const { integrationType } = useContext(ConfigContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const history = useHistory();
  const { post } = useHttp();

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

  const sendToOnOffice = async (
    sendToOnOfficeData: IApiOnOfficeUploadFileReq
  ): Promise<void> => {
    try {
      await post<void, IApiOnOfficeUploadFileReq>(
        "/api/on-office/upload-file",
        {
          ...sendToOnOfficeData,
          integrationId: realEstateListing!.integrationId!,
        }
      );

      toastSuccess("Die Daten wurden an onOffice gesendet!");
    } catch (e) {
      toastError("Der Fehler ist aufgetreten!");
      console.error(e);
    }
  };

  return { checkProdContAvailByAction, sendToOnOffice };
};

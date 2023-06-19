import { useContext } from "react";
import { useHistory } from "react-router-dom";

import { ConfigContext } from "../context/ConfigContext";
import { UserActionTypes, UserContext } from "../context/UserContext";
import { checkProdContAvailability } from "../shared/integration.functions";
import { toastError, toastSuccess } from "../shared/shared.functions";
import { TIntegrationActionTypes } from "../../../shared/types/integration";
import {
  IApiOnOfficeUploadFileReq,
  OnOfficeIntActTypesEnum,
} from "../../../shared/types/on-office";
import { useHttp } from "./http";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export const useIntegrationTools = () => {
  const { integrationType } = useContext(ConfigContext);
  const {
    userState: { integrationUser },
    userDispatch,
  } = useContext(UserContext);
  const {
    searchContextState: { realEstateListing },
    searchContextDispatch,
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

  const unlockLocationExport = async (
    realEstateListing: ApiRealEstateListing
  ): Promise<void> => {
    try {
      await post<void>(
        `/api/real-estate-listing-int/unlock-one-page-export/${realEstateListing.id}`
      );

      userDispatch({
        type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
        payload: {
          integrationType: integrationType!,
          actionType: OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE,
        },
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
        payload: { ...realEstateListing, isOnePageExportActive: true },
      });

      toastSuccess("Das Produkt wurde erfolgreich gekauft!");
    } catch (e) {
      toastError("Der Fehler ist aufgetreten!");
      console.error(e);
    }
  };

  return { checkProdContAvailByAction, sendToOnOffice, unlockLocationExport };
};

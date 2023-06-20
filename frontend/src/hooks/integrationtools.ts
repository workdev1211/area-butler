import { useContext } from "react";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";

import { ConfigContext } from "../context/ConfigContext";
import { UserActionTypes, UserContext } from "../context/UserContext";
import { checkProdContAvailability } from "../shared/integration.functions";
import { toastError, toastSuccess } from "../shared/shared.functions";
import {
  IApiUnlockIntProductReq,
  TIntegrationActionTypes,
} from "../../../shared/types/integration";
import {
  IApiOnOfficeUploadFileReq,
  OnOfficeIntActTypesEnum,
  TOnOfficeIntActTypes,
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

  const unlockProduct = async (
    actionType: TOnOfficeIntActTypes
  ): Promise<void> => {
    if (!realEstateListing) {
      return;
    }

    const errorMessage = "Das Produkt wurde nicht freigeschaltet!";

    try {
      await post<void, IApiUnlockIntProductReq>(
        "/api/real-estate-listing-int/unlock-product",
        { realEstateListingId: realEstateListing.id, actionType }
      );

      // TODO not exact expiration date but it's not relevant for the moment
      const iframeEndsAt = dayjs().add(6, "months").toDate();
      let updatedRealEstateListing: ApiRealEstateListing;

      switch (actionType) {
        // TODO a blank for future
        case OnOfficeIntActTypesEnum.UNLOCK_IFRAME: {
          updatedRealEstateListing = {
            ...realEstateListing,
            iframeEndsAt,
          };
          break;
        }

        case OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE: {
          updatedRealEstateListing = {
            ...realEstateListing,
            iframeEndsAt,
            isOnePageExportActive: true,
          };
          break;
        }

        case OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT: {
          updatedRealEstateListing = {
            ...realEstateListing,
            iframeEndsAt,
            isOnePageExportActive: true,
            isStatsFullExportActive: true,
          };
          break;
        }

        default: {
          throw new Error(errorMessage);
        }
      }

      searchContextDispatch({
        type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
        payload: updatedRealEstateListing,
      });

      userDispatch({
        type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
        payload: {
          integrationType: integrationType!,
          actionType: actionType,
        },
      });

      toastSuccess("Das Produkt wurde erfolgreich gekauft!");
    } catch (e) {
      toastError(errorMessage);
      console.error(e);
    }
  };

  return {
    checkProdContAvailByAction,
    sendToOnOffice,
    unlockProduct,
  };
};

import { useContext } from "react";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";

import { ConfigContext } from "../../context/ConfigContext";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { toastError, toastSuccess } from "../../shared/shared.functions";
import {
  IApiIntUpdEstTextFieldReq,
  IApiUnlockIntProductReq,
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from "../../../../shared/types/integration";
import {
  IApiOnOfficeUplEstFileOrLinkReq,
  TOnOfficeIntActTypes,
} from "../../../../shared/types/on-office";
import { useHttp } from "../http";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { getAvailProdContType } from "../../../../shared/functions/integration.functions";
import { initOpenAiReqQuantity } from "../../../../shared/constants/on-office/products";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../../../shared/types/integration-user";
import { useOnOfficeSync } from "../../on-office/hooks/onofficesync";
import { wrongIntegrationErrorMsg } from "../../../../shared/constants/integration";
import { usePropstackSync } from "../../propstack/hooks/propstacksync";

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
  const { sendToOnOffice } = useOnOfficeSync();
  const { sendToPropstack } = usePropstackSync();

  const getAvailProdContTypeOrFail = (
    actionType: TIntegrationActionTypes
  ): ApiIntUserOnOfficeProdContTypesEnum | undefined => {
    const availProdContType = getAvailProdContType(
      integrationType!,
      actionType,
      integrationUser?.availProdContingents
    );

    if (availProdContType) {
      return availProdContType;
    }

    toastError("Bitte kaufen Sie ein entsprechendes Produkt!", () => {
      history.push("/products");
    });
  };

  const sendToIntegration = async (
    sendToIntegrationData:
      | IApiIntUpdEstTextFieldReq
      | IApiOnOfficeUplEstFileOrLinkReq
  ): Promise<void> => {
    try {
      switch (integrationType) {
        case IntegrationTypesEnum.ON_OFFICE: {
          await sendToOnOffice(
            sendToIntegrationData,
            realEstateListing?.integrationId!
          );

          toastSuccess("Die Daten wurden an Propstack gesendet!");
          break;
        }

        case IntegrationTypesEnum.PROPSTACK: {
          await sendToPropstack(
            sendToIntegrationData as IApiIntUpdEstTextFieldReq,
            realEstateListing?.integrationId!
          );

          toastSuccess("Die Daten wurden an onOffice gesendet!");
          break;
        }

        default: {
          toastError(wrongIntegrationErrorMsg);
          console.error(wrongIntegrationErrorMsg);
          return;
        }
      }
    } catch (e) {
      toastError("Der Fehler ist aufgetreten!");
      console.error(e);
    }
  };

  const unlockProduct = async (
    actionType: TOnOfficeIntActTypes
  ): Promise<void> => {
    if (!realEstateListing?.integrationId) {
      return;
    }

    const availProdContType = getAvailProdContTypeOrFail(actionType);

    if (!availProdContType) {
      return;
    }

    const errorMessage = "Das Produkt wurde nicht freigeschaltet!";

    try {
      await post<void, IApiUnlockIntProductReq>(
        "/api/real-estate-listing-int/unlock-product",
        { integrationId: realEstateListing.integrationId, actionType }
      );

      // it's not an exact expiration date, but it's not relevant for the moment
      const iframeEndsAt = dayjs().add(6, "months").toJSON();
      let updatedRealEstateListing: ApiRealEstateListing;

      switch (availProdContType) {
        case ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI: {
          updatedRealEstateListing = {
            ...realEstateListing,
            openAiRequestQuantity: initOpenAiReqQuantity,
          };
          break;
        }

        case ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME: {
          updatedRealEstateListing = {
            ...realEstateListing,
            iframeEndsAt,
            openAiRequestQuantity: initOpenAiReqQuantity,
          };
          break;
        }

        case ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE: {
          updatedRealEstateListing = {
            ...realEstateListing,
            iframeEndsAt,
            isOnePageExportActive: true,
            openAiRequestQuantity: initOpenAiReqQuantity,
          };
          break;
        }

        case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT: {
          updatedRealEstateListing = {
            ...realEstateListing,
            iframeEndsAt,
            isOnePageExportActive: true,
            isStatsFullExportActive: true,
            openAiRequestQuantity: initOpenAiReqQuantity,
          };
          break;
        }

        default: {
          toastError(errorMessage);
          return;
        }
      }

      searchContextDispatch({
        type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
        payload: updatedRealEstateListing,
      });

      userDispatch({
        type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
        payload: availProdContType,
      });

      toastSuccess("Das Produkt wurde erfolgreich gekauft!");
    } catch (e) {
      toastError(errorMessage);
      console.error(e);
    }
  };

  return {
    sendToIntegration,
    getAvailProdContTypeOrFail,
    unlockProduct,
  };
};

import { useContext } from "react";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";

import { ConfigContext } from "../../context/ConfigContext";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { toastError, toastSuccess } from "../../shared/shared.functions";
import {
  IApiUnlockIntProductReq,
  IntegrationActionTypeEnum,
  IntegrationTypesEnum,
  TSendToIntegrationData,
} from "../../../../shared/types/integration";
import { useHttp } from "../http";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { getAvailProdContType } from "../../../../shared/functions/integration.functions";
import { initOpenAiReqQuantity } from "../../../../shared/constants/on-office/on-office-products";
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  ApiIntUserPropstackProdContTypesEnum,
  TApiIntUserProdContType,
} from "../../../../shared/types/integration-user";
import { useOnOfficeSync } from "../../on-office/hooks/onofficesync";
import {
  integrationNames,
  wrongIntegrationErrorMsg,
} from "../../../../shared/constants/integration";
import { usePropstackSync } from "../../propstack/hooks/propstacksync";
import { useMyVivendaSync } from "../../my-vivenda/hooks/myvivendasync";

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
  const { sendToMyVivenda } = useMyVivendaSync();
  const { sendToOnOffice } = useOnOfficeSync();
  const { sendToPropstack } = usePropstackSync();

  const checkIsSubActive = () =>
    dayjs().isBefore(integrationUser?.subscription?.expiresAt);

  const getAvailProdContTypeOrFail = (
    actionType: IntegrationActionTypeEnum
  ): TApiIntUserProdContType | undefined => {
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
    sendToIntegrationData: TSendToIntegrationData
  ): Promise<void> => {
    if (integrationType !== IntegrationTypesEnum.MY_VIVENDA) {
      if (!realEstateListing?.integrationId) {
        const errorMessage = "Die Integrations-ID wird nicht angegeben!"; // Integration id is not provided!
        toastError(errorMessage);
        console.error(errorMessage);
        return;
      }

      sendToIntegrationData.integrationId = realEstateListing.integrationId;
    }

    if (!Object.values(IntegrationTypesEnum).includes(integrationType!)) {
      toastError(wrongIntegrationErrorMsg);
      console.error(wrongIntegrationErrorMsg);
      return;
    }

    try {
      switch (integrationType) {
        case IntegrationTypesEnum.MY_VIVENDA: {
          await sendToMyVivenda(sendToIntegrationData);
          break;
        }

        case IntegrationTypesEnum.ON_OFFICE: {
          await sendToOnOffice(sendToIntegrationData);
          break;
        }

        case IntegrationTypesEnum.PROPSTACK: {
          await sendToPropstack(sendToIntegrationData);
          break;
        }
      }

      toastSuccess(
        `Die Daten wurden an ${integrationNames[integrationType!]} gesendet!`
      );
    } catch (e) {
      toastError("Der Fehler ist aufgetreten!");
      console.error(e);
    }
  };

  const unlockProduct = async (
    actionType: IntegrationActionTypeEnum
  ): Promise<void> => {
    if (!realEstateListing?.integrationId || checkIsSubActive()) {
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
        case ApiIntUserPropstackProdContTypesEnum.OPEN_AI:
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

        case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT:
        case ApiIntUserPropstackProdContTypesEnum.STATS_EXPORT: {
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

      toastSuccess("Die Adresse wurde erfolgreich freigeschaltet!");
    } catch (e) {
      toastError(errorMessage);
      console.error(e);
    }
  };

  return {
    checkIsSubActive,
    getAvailProdContTypeOrFail,
    sendToIntegration,
    unlockProduct,
  };
};

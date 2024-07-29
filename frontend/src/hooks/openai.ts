import { useContext } from "react";

import { useHttp } from "./http";
import {
  IApiOpenAiImproveTextQuery,
  IApiOpenAiLocDescQuery,
  IApiOpenAiLocRealEstDescQuery,
  IApiOpenAiQuery,
  IApiOpenAiRealEstDescQuery,
  OpenAiQueryTypeEnum,
} from "../../../shared/types/open-ai";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { toastError } from "../shared/shared.functions";
import { UserActionTypes, UserContext } from "../context/UserContext";
import { ConfigContext } from "../context/ConfigContext";
import { useIntegrationTools } from "./integration/integrationtools";
import { initOpenAiReqQuantity } from "../../../shared/constants/on-office/on-office-products";
import { TApiIntUserProdContType } from "../../../shared/types/integration-user";
import { IntegrationActionTypeEnum } from "../../../shared/types/integration";

export type TOpenAiQuery = { integrationId?: string } & (
  | IApiOpenAiLocDescQuery
  | IApiOpenAiRealEstDescQuery
  | IApiOpenAiLocRealEstDescQuery
  | IApiOpenAiImproveTextQuery
  | IApiOpenAiQuery
);

export const useOpenAi = () => {
  const { integrationType } = useContext(ConfigContext);
  const { userDispatch } = useContext(UserContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { checkIsSubActive, getAvailProdContTypeOrFail } =
    useIntegrationTools();
  const { post } = useHttp();

  const isIntegration = !!integrationType;
  const realEstateListing = searchContextState.realEstateListing!;

  const fetchOpenAiResponse = async (
    openAiQueryType: OpenAiQueryTypeEnum,
    openAiQuery: TOpenAiQuery
  ): Promise<string> => {
    const resOpenAiQuery: TOpenAiQuery = { ...openAiQuery };
    let availProdContType: TApiIntUserProdContType | undefined;

    if (
      isIntegration &&
      !checkIsSubActive() &&
      !realEstateListing.openAiRequestQuantity
    ) {
      availProdContType = getAvailProdContTypeOrFail(
        IntegrationActionTypeEnum.UNLOCK_OPEN_AI
      );

      if (!availProdContType) {
        return "";
      }
    }

    // required only for the proper request number count
    if (isIntegration) {
      resOpenAiQuery.integrationId = realEstateListing.integrationId;
    }

    let url;

    switch (openAiQueryType) {
      case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION: {
        url = isIntegration
          ? "/api/open-ai-int/loc-desc"
          : "/api/open-ai/loc-desc";
        break;
      }

      case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
        url = isIntegration
          ? "/api/open-ai-int/real-est-desc"
          : "/api/open-ai/real-est-desc";
        break;
      }

      case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION: {
        url = isIntegration
          ? "/api/open-ai-int/loc-real-est-desc"
          : "/api/open-ai/loc-real-est-desc";
        break;
      }

      case OpenAiQueryTypeEnum.IMPROVE_TEXT: {
        url = isIntegration
          ? "/api/open-ai-int/improve-text"
          : "/api/open-ai/improve-text";
        break;
      }

      case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
      case OpenAiQueryTypeEnum.GENERAL_QUESTION:
      default: {
        url = isIntegration ? "/api/open-ai-int/query" : "/api/open-ai/query";
      }
    }

    let queryResponse;

    try {
      queryResponse = (await post<string>(url, resOpenAiQuery)).data;
    } catch (e) {
      toastError("Fehler beim Senden der KI-Anfrage!");
      return "";
    }

    if (!isIntegration || checkIsSubActive()) {
      return queryResponse;
    }

    let openAiRequestQuantity = realEstateListing.openAiRequestQuantity;

    if (!openAiRequestQuantity) {
      openAiRequestQuantity = initOpenAiReqQuantity;

      userDispatch({
        type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
        payload: availProdContType!,
      });
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: {
        ...realEstateListing,
        openAiRequestQuantity: openAiRequestQuantity! - 1,
      },
    });

    return queryResponse;
  };

  return { fetchOpenAiResponse };
};

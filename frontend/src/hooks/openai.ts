import { useContext } from "react";

import { useHttp } from "./http";
import {
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
import { useIntegrationTools } from "./integrationtools";
import { initOpenAiReqQuantity } from "../../../shared/constants/on-office/products";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../../shared/types/integration-user";

export type TOpenAiQuery =
  | IApiOpenAiLocDescQuery
  | IApiOpenAiRealEstDescQuery
  | IApiOpenAiLocRealEstDescQuery
  | IApiOpenAiQuery;

export const useOpenAi = () => {
  const { integrationType } = useContext(ConfigContext);
  const { userDispatch } = useContext(UserContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { getAvailProdContTypeOrFail } = useIntegrationTools();
  const { post } = useHttp();

  const isIntegration = !!integrationType;
  const realEstateListing = searchContextState.realEstateListing!;

  const fetchOpenAiResponse = async (
    openAiQueryType: OpenAiQueryTypeEnum,
    openAiQuery: TOpenAiQuery
  ): Promise<string> => {
    let queryResponse;
    let url;

    switch (openAiQueryType) {
      case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION: {
        url = isIntegration
          ? "/api/location-int/open-ai-loc-desc"
          : "/api/location/open-ai-loc-desc";
        break;
      }

      case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
        url = isIntegration
          ? "/api/real-estate-listing-int/open-ai-real-estate-desc"
          : "/api/real-estate-listing/open-ai-real-estate-desc";
        break;
      }

      case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION: {
        url = isIntegration
          ? "/api/location-int/open-ai-loc-real-est-desc"
          : "/api/location/open-ai-loc-real-est-desc";
        break;
      }

      case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
      case OpenAiQueryTypeEnum.GENERAL_QUESTION:
      default: {
        url = isIntegration ? "/api/open-ai-int/query" : "/api/open-ai/query";
      }
    }

    let availProdContType: ApiIntUserOnOfficeProdContTypesEnum | undefined;

    if (isIntegration && !realEstateListing.openAiRequestQuantity) {
      availProdContType = getAvailProdContTypeOrFail(openAiQueryType);

      if (!availProdContType) {
        return "";
      }
    }

    if (isIntegration && !openAiQuery.realEstateListingId) {
      openAiQuery.realEstateListingId = realEstateListing.id;
    }

    try {
      queryResponse = (await post<string>(url, openAiQuery)).data;
    } catch (e) {
      toastError("Fehler beim Senden der KI-Anfrage!");
      return "";
    }

    if (!isIntegration) {
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

import { useContext } from "react";

import { useHttp } from "./http";
import {
  IApiOpenAiLocationDescriptionQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
} from "../../../shared/types/open-ai";
import { SearchContext } from "../context/SearchContext";

export const useOpenAi = (isIntegrationUser = false) => {
  const { searchContextState } = useContext(SearchContext);

  const { post } = useHttp();

  const fetchLocationDescription = async (
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery
  ): Promise<string> => {
    const resultingQuery = { ...locationDescriptionQuery };

    if (isIntegrationUser) {
      resultingQuery.realEstateListingId =
        searchContextState.realEstateListing!.id;
    }

    return (
      await post<string, IApiOpenAiLocationDescriptionQuery>(
        isIntegrationUser
          ? "/api/location-integration/open-ai-loc-desc"
          : "/api/location/open-ai-loc-desc",
        resultingQuery
      )
    ).data;
  };

  const fetchRealEstateDescription = async (
    realEstateDescriptionQuery: IApiOpenAiRealEstateDescriptionQuery
  ): Promise<string> => {
    return (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        isIntegrationUser
          ? "/api/real-estate-listing-int/open-ai-real-estate-desc"
          : "/api/real-estate-listing/open-ai-real-estate-desc",
        realEstateDescriptionQuery
      )
    ).data;
  };

  const fetchLocRealEstDesc = async (
    locationRealEstateDescriptionQuery: IApiOpenAiLocationRealEstateDescriptionQuery
  ): Promise<string> => {
    return (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        isIntegrationUser
          ? "/api/location-integration/open-ai-loc-real-est-desc"
          : "/api/location/open-ai-loc-real-est-desc",
        locationRealEstateDescriptionQuery
      )
    ).data;
  };

  const fetchQuery = async (query: IApiOpenAiQuery): Promise<string> => {
    const resultingQuery = { ...query };

    if (isIntegrationUser) {
      resultingQuery.realEstateListingId =
        searchContextState.realEstateListing!.id;
    }

    return (
      await post<string, IApiOpenAiQuery>(
        isIntegrationUser
          ? "/api/open-ai-integration/query"
          : "/api/open-ai/query",
        resultingQuery
      )
    ).data;
  };

  return {
    fetchLocationDescription,
    fetchRealEstateDescription,
    fetchLocRealEstDesc,
    fetchQuery,
  };
};

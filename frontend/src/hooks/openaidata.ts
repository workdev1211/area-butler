import { useContext, useEffect } from "react";

import { useHttp } from "./http";
import {
  IApiOpenAiLocationDescriptionQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
} from "../../../shared/types/open-ai";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import { SearchContext } from "../context/SearchContext";
import { useRealEstateData } from "./realestatedata";

export const useOpenAiData = (isIntegrationUser = false) => {
  const {
    realEstateState: { listings },
    realEstateDispatch,
  } = useContext(RealEstateContext);
  const {
    searchContextState: { integrationId },
  } = useContext(SearchContext);

  const { fetchRealEstateByIntId } = useRealEstateData();
  const { post } = useHttp();

  useEffect(() => {
    if (!isIntegrationUser || !integrationId) {
      return;
    }

    const fetchRealEstateData = async () => {
      const realEstates = [await fetchRealEstateByIntId(integrationId)];

      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: realEstates,
      });
    };

    void fetchRealEstateData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntegrationUser, integrationId, realEstateDispatch]);

  const fetchLocationDescription = async (
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery
  ): Promise<string> => {
    const resultingQuery = { ...locationDescriptionQuery };

    if (isIntegrationUser) {
      Object.assign(resultingQuery, {
        integrationId,
        realEstateListingId: listings[0].id,
      });
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
      Object.assign(resultingQuery, {
        integrationId,
        realEstateListingId: listings[0].id,
      });
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

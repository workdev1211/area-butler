import { useHttp } from "./http";
import {
  IApiOpenAiLocationDescriptionQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
} from "../../../shared/types/open-ai";

export const useOpenAiData = (isIntegrationUser = false) => {
  const { post } = useHttp();

  const fetchLocationDescription = async (
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiLocationDescriptionQuery>(
        isIntegrationUser
          ? "/api/location-integration/open-ai-loc-desc"
          : "/api/location/open-ai-loc-desc",
        locationDescriptionQuery
      )
    ).data;

  const fetchRealEstateDescription = async (
    realEstateDescriptionQuery: IApiOpenAiRealEstateDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        isIntegrationUser
          ? "/api/real-estate-listing-int/open-ai-real-estate-desc"
          : "/api/real-estate-listing/open-ai-real-estate-desc",
        realEstateDescriptionQuery
      )
    ).data;

  const fetchLocRealEstDesc = async (
    locationRealEstateDescriptionQuery: IApiOpenAiLocationRealEstateDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        isIntegrationUser
          ? "/api/location-integration/open-ai-loc-real-est-desc"
          : "/api/location/open-ai-loc-real-est-desc",
        locationRealEstateDescriptionQuery
      )
    ).data;

  const fetchQuery = async (query: IApiOpenAiQuery): Promise<string> =>
    (
      await post<string, IApiOpenAiQuery>(
        isIntegrationUser
          ? "/api/open-ai-integration/query"
          : "/api/open-ai/query",
        query
      )
    ).data;

  return {
    fetchLocationDescription,
    fetchRealEstateDescription,
    fetchLocRealEstDesc,
    fetchQuery,
  };
};

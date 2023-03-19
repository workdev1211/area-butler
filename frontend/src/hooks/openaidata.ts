import { useHttp } from "./http";
import {
  IApiOpenAiLocationDescriptionQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
} from "../../../shared/types/open-ai";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export const useOpenAiData = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post } = useHttp();

  const fetchLocationDescription = async (
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiLocationDescriptionQuery>(
        integrationUser
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
        integrationUser
          ? "/api/real-estate-listings-int/open-ai-real-estate-desc"
          : "/api/real-estate-listings/open-ai-real-estate-desc",
        realEstateDescriptionQuery
      )
    ).data;

  const fetchLocRealEstDesc = async (
    locationRealEstateDescriptionQuery: IApiOpenAiLocationRealEstateDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        integrationUser
          ? "/api/location-integration/open-ai-loc-real-est-desc"
          : "/api/location/open-ai-loc-real-est-desc",
        locationRealEstateDescriptionQuery
      )
    ).data;

  const fetchQuery = async (query: IApiOpenAiQuery): Promise<string> =>
    (
      await post<string, IApiOpenAiQuery>(
        integrationUser
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

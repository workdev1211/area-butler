import { useHttp } from "./http";
import {
  IApiOpenAiLocationDescriptionQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
} from "../../../shared/types/open-ai";

export const useOpenAiData = (url?: string) => {
  const { post } = useHttp();

  const fetchLocationDescription = async (
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiLocationDescriptionQuery>(
        url || "/api/location/open-ai-location-description",
        locationDescriptionQuery
      )
    ).data;

  const fetchRealEstateDescription = async (
    realEstateDescriptionQuery: IApiOpenAiRealEstateDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        url || "/api/real-estate-listings/open-ai-real-estate-description",
        realEstateDescriptionQuery
      )
    ).data;

  const fetchLocationRealEstateDescription = async (
    locationRealEstateDescriptionQuery: IApiOpenAiLocationRealEstateDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        url || "/api/location/open-ai-location-real-estate-description",
        locationRealEstateDescriptionQuery
      )
    ).data;

  const fetchQuery = async (query: IApiOpenAiQuery): Promise<string> =>
    (await post<string, IApiOpenAiQuery>(url || "/api/open-ai/query", query))
      .data;

  return {
    fetchLocationDescription,
    fetchRealEstateDescription,
    fetchLocationRealEstateDescription,
    fetchQuery,
  };
};

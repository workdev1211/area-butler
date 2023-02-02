import { useHttp } from "./http";
import {
  IApiOpenAiLocationDescriptionQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
} from "../../../shared/types/open-ai";

export const useOpenAiData = () => {
  const { post } = useHttp();

  const fetchLocationDescription = async (
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiLocationDescriptionQuery>(
        "/api/location/open-ai-location-description",
        locationDescriptionQuery
      )
    ).data;

  const fetchRealEstateDescription = async (
    realEstateDescriptionQuery: IApiOpenAiRealEstateDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        "/api/real-estate-listings/open-ai-real-estate-description",
        realEstateDescriptionQuery
      )
    ).data;

  const fetchLocationRealEstateDescription = async (
    locationRealEstateDescriptionQuery: IApiOpenAiLocationRealEstateDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiRealEstateDescriptionQuery>(
        "/api/location/open-ai-location-real-estate-description",
        locationRealEstateDescriptionQuery
      )
    ).data;

  const fetchQuery = async (query: IApiOpenAiQuery): Promise<string> =>
    (await post<string, IApiOpenAiQuery>("/api/open-ai/query", query)).data;

  return {
    fetchLocationDescription,
    fetchRealEstateDescription,
    fetchLocationRealEstateDescription,
    fetchQuery,
  };
};

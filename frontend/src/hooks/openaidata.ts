import { useHttp } from "./http";
import {
  IApiOpenAiLocationDescriptionQuery,
  IOpenAiRealEstateDescriptionFormValues
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
    realEstateQuery: IOpenAiRealEstateDescriptionFormValues
  ): Promise<string> =>
    (
      await post<string, IOpenAiRealEstateDescriptionFormValues>(
        "/api/real-estate-listings/open-ai-real-estate-description",
        realEstateQuery
      )
    ).data;

  return { fetchLocationDescription, fetchRealEstateDescription };
};

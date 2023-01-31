import { useHttp } from "./http";
import { IApiOpenAiLocationDescriptionQuery } from "../../../shared/types/open-ai";

export const useOpenAiData = () => {
  const { post } = useHttp();

  const fetchLocationDescription = async (
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery
  ): Promise<string> =>
    (
      await post<string, IApiOpenAiLocationDescriptionQuery>(
        "/api/location/ai-description",
        locationDescriptionQuery
      )
    ).data;

  return { fetchLocationDescription };
};

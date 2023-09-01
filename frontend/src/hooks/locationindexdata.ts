import { useContext } from "react";

import { ApiCoordinates } from "../../../shared/types/types";
import { useHttp } from "./http";
import {
  IApiLocationIndexFeature,
  TLocationIndexData,
} from "../../../shared/types/location-index";
import { UserContext } from "../context/UserContext";
import { processLocationIndices } from "../../../shared/functions/location-index.functions";

export const useLocationIndexData = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post } = useHttp();

  const isIntegrationUser = !!integrationUser;

  const fetchLocationIndexData = async (
    coordinates: ApiCoordinates
  ): Promise<TLocationIndexData | undefined> => {
    const { data } = await post<IApiLocationIndexFeature[]>(
      isIntegrationUser
        ? "/api/location-index-int/query"
        : "/api/location-index/query",
      { type: "Point", coordinates: [coordinates.lng, coordinates.lat] }
    );

    if (!data?.length || !data[0].properties) {
      return;
    }

    return processLocationIndices(data[0].properties, true);
  };

  return { fetchLocationIndexData };
};

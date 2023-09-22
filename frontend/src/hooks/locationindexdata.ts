import { useContext } from "react";

import { ApiCoordinates } from "../../../shared/types/types";
import { useHttp } from "./http";
import {
  IApiLocationIndexFeature,
  TLocationIndexData,
} from "../../../shared/types/location-index";
import { processLocationIndices } from "../../../shared/functions/location-index.functions";
import { ConfigContext } from "../context/ConfigContext";

export const useLocationIndexData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { post } = useHttp();

  const isIntegration = !!integrationType;

  const fetchLocationIndexData = async (
    coordinates: ApiCoordinates
  ): Promise<TLocationIndexData | undefined> => {
    const { data } = await post<IApiLocationIndexFeature[]>(
      isIntegration
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

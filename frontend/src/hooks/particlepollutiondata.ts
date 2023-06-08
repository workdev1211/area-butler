import { useContext } from "react";

import {
  ApiCoordinates,
  ApiGeojsonFeature,
  ApiGeometry,
} from "../../../shared/types/types";
import { useHttp } from "./http";
import { UserContext } from "../context/UserContext";

export const useParticlePollutionData = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post } = useHttp();

  const isIntegrationUser = !!integrationUser;

  const fetchParticlePollutionData = async (
    point: ApiCoordinates
  ): Promise<ApiGeojsonFeature[] | undefined> => {
    const geo: ApiGeometry = {
      type: "Point",
      coordinates: [point.lng, point.lat],
    };

    const { data } = await post<ApiGeojsonFeature[]>(
      isIntegrationUser
        ? "/api/particle-pollution-int/query"
        : "/api/particle-pollution/query",
      geo
    );

    if (!data?.length) {
      return;
    }

    return data;
  };

  return { fetchParticlePollutionData };
};

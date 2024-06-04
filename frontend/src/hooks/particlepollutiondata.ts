import { useContext } from "react";

import {
  ApiCoordinates,
  ApiGeojsonFeature,
  ApiGeometry,
} from "../../../shared/types/types";
import { useHttp } from "./http";
import { ConfigContext } from "../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../shared/types/integration";

export const useParticlePollutionData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { post } = useHttp();

  const isIntegration = !!integrationType;

  const fetchParticlePollutionData = async (
    point: ApiCoordinates
  ): Promise<ApiGeojsonFeature[] | undefined> => {
    if (integrationType === IntegrationTypesEnum.MY_VIVENDA) {
      return;
    }

    const geo: ApiGeometry = {
      type: "Point",
      coordinates: [point.lng, point.lat],
    };

    const { data } = await post<ApiGeojsonFeature[]>(
      isIntegration
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

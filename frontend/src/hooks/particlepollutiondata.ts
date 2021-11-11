import {
  ApiCoordinates,
  ApiGeojsonFeature,
  ApiGeometry,
} from "../../../shared/types/types";
import { useHttp } from "./http";

export const useParticlePollutionData = () => {
  const { post } = useHttp();

  const fetchParticlePollutionData = async (
    point: ApiCoordinates
  ): Promise<ApiGeojsonFeature[]> => {
    const geo: ApiGeometry = {
      type: "Point",
      coordinates: [point.lng, point.lat],
    };
    const result = (
      await post<ApiGeojsonFeature[]>("/api/particle-pollution/query", geo)
    ).data;

    return result;
  };
  return { fetchParticlePollutionData };
};

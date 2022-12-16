import { ApiCoordinates } from "../../../shared/types/types";
import { useHttp } from "./http";
import {
  ApiLocationIndexFeaturePropertiesEnum,
  IApiLocationIndexFeature,
  LocationIndicesEnum,
} from "../../../shared/types/location-index";
import { locationIndexNames } from "../../../shared/constants/location-index";

export type TLocationIndexData = Record<
  LocationIndicesEnum,
  { name: string; value: number; color: "#32cd32" | "#ffa500" | "#ff4040" }
>;

export const useLocationIndexData = () => {
  const { post } = useHttp();

  const fetchLocationIndexData = async (
    coordinates: ApiCoordinates
  ): Promise<TLocationIndexData | undefined> => {
    const { data } = await post<IApiLocationIndexFeature[]>(
      "/api/location-index/query",
      { type: "Point", coordinates: [coordinates.lng, coordinates.lat] }
    );

    if (!data.length || !data[0].properties) {
      return undefined;
    }

    return Object.keys(data[0].properties).reduce<TLocationIndexData>(
      (result, propertyName, i) => {
        const locationIndexName =
          LocationIndicesEnum[
            propertyName as ApiLocationIndexFeaturePropertiesEnum
          ];

        const locationIndexValue = Math.round(
          data[0].properties[
            propertyName as ApiLocationIndexFeaturePropertiesEnum
          ] * 100
        );

        result[locationIndexName] = {
          name: locationIndexNames[locationIndexName],
          value: locationIndexValue,
          color:
            locationIndexValue < 20
              ? "#ff4040"
              : locationIndexValue < 60
              ? "#ffa500"
              : "#32cd32",
        };

        return result;
      },
      {} as TLocationIndexData
    );
  };

  return { fetchLocationIndexData };
};

import { useContext } from "react";

import { ApiCoordinates } from "../../../shared/types/types";
import { useHttp } from "./http";
import {
  ApiLocIndexFeatPropsEnum,
  IApiLocationIndexFeature,
  LocationIndicesEnum,
} from "../../../shared/types/location-index";
import { locationIndexNames } from "../../../shared/constants/location";
import { UserContext } from "../context/UserContext";

export type TLocationIndexData = Record<
  LocationIndicesEnum,
  {
    name: string;
    value: number;
    colorStyle: { backgroundColor: "#007960"; opacity: number };
  }
>;

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

    return Object.keys(data[0].properties).reduce<TLocationIndexData>(
      (result, propertyName) => {
        const locationIndexName =
          LocationIndicesEnum[propertyName as ApiLocIndexFeatPropsEnum];

        const locationIndexValue = Math.round(
          data[0].properties[propertyName as ApiLocIndexFeatPropsEnum] * 100
        );

        result[locationIndexName] = {
          name: locationIndexNames[locationIndexName],
          value: locationIndexValue,
          colorStyle: {
            backgroundColor: "#007960",
            opacity:
              locationIndexValue < 20
                ? 0.5
                : locationIndexValue < 60
                ? 0.75
                : 1,
          },
        };

        return result;
      },
      {} as TLocationIndexData
    );
  };

  return { fetchLocationIndexData };
};

import {
  ApiLocIndexFeatPropsEnum,
  LocationIndicesEnum,
  TApiLocationIndexFeatureProperties,
  TLocationIndexData,
} from "../types/location-index";
import { locationIndexNames } from "../constants/location-index";

export const processLocationIndices = (
  locationIndices: TApiLocationIndexFeatureProperties,
  withColors = false
): TLocationIndexData => {
  return Object.keys(locationIndices).reduce<TLocationIndexData>(
    (result, propertyName) => {
      const locationIndexName =
        LocationIndicesEnum[propertyName as ApiLocIndexFeatPropsEnum];

      const locationIndexValue = Math.round(
        locationIndices[propertyName as ApiLocIndexFeatPropsEnum] * 100
      );

      result[locationIndexName] = {
        name: locationIndexNames[locationIndexName],
        value: locationIndexValue,
      };

      if (withColors) {
        result[locationIndexName].colorStyle = {
          backgroundColor: "#007960",
          opacity:
            locationIndexValue < 20 ? 0.5 : locationIndexValue < 60 ? 0.75 : 1,
        };
      }

      return result;
    },
    {} as TLocationIndexData
  );
};

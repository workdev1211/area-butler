import {
  ILocationIndex,
  LocIndexPropsEnum,
  TApiLocIndexProps,
  TLocationIndexData,
} from "../types/location-index";

export const processLocationIndices = (
  locationIndices: TApiLocIndexProps,
  withColors = false
): TLocationIndexData => {
  return Object.keys(locationIndices).reduce<TLocationIndexData>(
    (result, propertyName) => {
      const locationIndexName = propertyName;

      const locationIndexValue = Math.round(
        locationIndices[propertyName as LocIndexPropsEnum] * 100
      );

      const locationIndexData: ILocationIndex = {
        name: locationIndexName,
        value: locationIndexValue,
      };

      if (withColors) {
        locationIndexData.colorStyle = {
          backgroundColor: "#007960",
          opacity:
            locationIndexValue < 20 ? 0.5 : locationIndexValue < 60 ? 0.75 : 1,
        };
      }

      result[propertyName as LocIndexPropsEnum] = locationIndexData;

      return result;
    },
    {} as TLocationIndexData
  );
};

import {
  minutesToMetersMultipliers,
  osmEntityTypes,
  umlautMap,
} from "../constants/constants";
import {
  ApiCoordinates,
  ApiOsmEntity,
  MeansOfTransportation,
} from "../types/types";

export const groupBy = (xs: any, f: any): Record<string, any> =>
  xs.reduce(
    (r: any, v: any, i: any, a: any, k = f(v)) => (
      // eslint-disable-next-line no-sequences
      (r[k] || (r[k] = [])).push(v), r
    ),
    {}
  );

export const getBidirectionalMapping = <R, T>(
  mapping: Map<R, T>
): Map<R | T, T | R> => {
  return new Map(
    [...mapping].reduce((result, [key, value]) => {
      result.push([key, value], [value, key]);

      return result;
    }, [])
  );
};

export const camelize = (str: string): string =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

export const getCombinedOsmEntityTypes = (
  osmEntities = osmEntityTypes
): ApiOsmEntity[] => {
  return osmEntities.reduce<ApiOsmEntity[]>((result, entity) => {
    const hasEntity = result.some(({ label }) => label === entity.label);

    if (!hasEntity) {
      result.push(entity);
    }

    return result;
  }, []);
};

export const getUncombinedOsmEntityTypes = (
  osmEntities: ApiOsmEntity[]
): ApiOsmEntity[] => {
  return osmEntities.reduce<ApiOsmEntity[]>((result, entity) => {
    const hasEntity = result.some(({ label }) => label === entity.label);

    const filteredEntities = osmEntityTypes.filter(
      ({ label }) => label === entity.label
    );

    if (hasEntity) {
      return result;
    }

    result.push(...filteredEntities);

    return result;
  }, []);
};

export const createChunks = <T = unknown>(
  initialArray: Array<T>,
  size: number
): Array<T>[] =>
  Array.from(
    new Array(Math.ceil(initialArray.length / size)),
    (arrayValue, i) => initialArray.slice(i * size, i * size + size)
  );

export const convertPriceToHuman = (price: number): string =>
  `${price.toFixed(2)} €`;

export const getOnOfficeSortedMapData = (data: unknown): unknown => {
  if (!Array.isArray(data) && typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((element) => getOnOfficeSortedMapData(element)).sort();
  }

  const resultingMap = new Map();
  const keys = Object.keys(data).sort();

  if (!keys.length) {
    return resultingMap;
  }

  for (const key of keys) {
    resultingMap.set(key, getOnOfficeSortedMapData(data[key]));
  }

  return resultingMap;
};

export const buildOnOfficeQueryString = (
  data: any,
  skippedKeys?: string[]
): string => {
  // ".replace(/%2B/g, "+")" hack is needed because of the OnOffice query string decoding
  let queryString = "";

  for (const [key, value] of data) {
    if (Array.isArray(value)) {
      value.every((valueElement, i) => {
        if (typeof valueElement === "object") {
          queryString += queryString ? "&" : "";
          queryString += `${buildOnOfficeQueryString([
            [[`${key}[${i}]`], valueElement],
          ])}`;

          return true;
        }

        queryString += queryString ? "&" : "";
        queryString += `${encodeURIComponent(
          `${key}[${i}]`
        )}=${encodeURIComponent(valueElement).replace(/%2B/g, "+")}`;

        return true;
      });

      continue;
    }

    if (value instanceof Map) {
      for (const [valueKey, valueValue] of value) {
        if (typeof valueValue === "object") {
          queryString += queryString ? "&" : "";
          queryString += `${buildOnOfficeQueryString([
            [[`${key}[${valueKey}]`], valueValue],
          ])}`;

          continue;
        }

        queryString += queryString ? "&" : "";
        queryString += `${encodeURIComponent(
          `${key}[${valueKey}]`
        )}=${encodeURIComponent(value.get(valueKey)).replace(/%2B/g, "+")}`;
      }

      continue;
    }

    queryString += queryString ? "&" : "";

    if (skippedKeys?.includes(key)) {
      queryString += `${key}=${value}`.replace(/%2B/g, "+");
      continue;
    }

    queryString += `${new URLSearchParams([[key, value]])}`.replace(
      /%2B/g,
      "+"
    );
  }

  return queryString;
};

export const randomInt = (min = -10, max = 10) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomizeCoordinates = ({
  lat,
  lng,
}: ApiCoordinates): ApiCoordinates => {
  const d1 = randomInt() / 10000;
  const d2 = randomInt() / 10000;

  return {
    lat: lat + d1,
    lng: lng + d2,
  };
};

export const replaceUmlautWithEnglish = (text: string): string => {
  let processedText = text;
  const umlautMapEntries = Object.entries(umlautMap);

  for (let i = 0; i < umlautMapEntries.length; i++) {
    processedText = processedText.replace(
      umlautMapEntries[i][0],
      umlautMapEntries[i][1]
    );
  }

  return processedText;
};

export const parseCommaFloat = (value: string): number =>
  value && parseFloat(value.replace(",", "."));

export const truncateText = (text: string, limit: number): string =>
  limit < 4 || text.length <= limit
    ? text
    : `${text.substring(0, limit - 3)}...`;

export const convertMetersToMinutes = (
  distanceInMeters: number,
  mean: MeansOfTransportation
) => Math.round(distanceInMeters / (minutesToMetersMultipliers[mean] || 1));

export const convertMinutesToMeters = (
  distanceInMinutes: number,
  transportMode: MeansOfTransportation
): number => {
  const multiplier = minutesToMetersMultipliers[transportMode];

  if (!multiplier) {
    return 0;
  }

  return distanceInMinutes * 1.2 * multiplier;
};

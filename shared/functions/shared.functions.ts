import { osmEntityTypes } from "../constants/constants";
import { ApiOsmEntity } from "../types/types";

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

export const buildOnOfficeQueryString = (data: any): string => {
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
    queryString += `${new URLSearchParams([[key, value]])}`.replace(
      /%2B/g,
      "+"
    );
  }

  return queryString;
};

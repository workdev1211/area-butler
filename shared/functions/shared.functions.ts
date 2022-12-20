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

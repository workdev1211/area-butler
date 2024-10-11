import { minutesToMetersMultipliers, umlautMap } from "../constants/constants";
import { ApiCoordinates, MeansOfTransportation } from "../types/types";

export const groupBy = (xs: any, f: any): Record<string, any> =>
  xs.reduce(
    (r: any, v: any, i: any, a: any, k = f(v)) => (
      // eslint-disable-next-line no-sequences
      (r[k] || (r[k] = [])).push(v), r
    ),
    {}
  );

export const getReverseMapping = <K, V>(mapping: Map<K, V>): Map<V, K> => {
  const reverseMap = new Map<V, K>();

  mapping.forEach((value, key) => {
    reverseMap.set(value, key);
  });

  return reverseMap;
};

export const getBidirectionalMapping = <K, V>(
  mapping: Map<K, V>
): Map<K | V, V | K> => {
  const bidirectionalMapping = new Map<K | V, V | K>();

  mapping.forEach((value, key) => {
    bidirectionalMapping.set(key, value);
    bidirectionalMapping.set(value, key);
  });

  return bidirectionalMapping;
};

export const camelize = (str: string): string =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

export const createChunks = <T = unknown>(arr: T[], size: number): Array<T[]> =>
  arr.reduce<Array<T[]>>((result, curVal, i) => {
    if (i % size === 0) {
      result.push([curVal]);
    } else {
      result[result.length - 1].push(curVal);
    }

    return result;
  }, []);

export const convertPriceToHuman = (price: number): string =>
  `${price.toFixed(2)} €`;

export const randomInt = (min = -10, max = 10) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomizeCoordinates = ({
  lat,
  lng,
}: ApiCoordinates): ApiCoordinates => {
  const getRandom = (): number => {
    const min = 0.00069; // 90 meters
    const max = 0.00115; // 150 meters
    const rand = Math.random() * (max - min) + min;

    return Math.random() >= 0.5 ? rand : -rand;
  };

  return {
    lat: lat + getRandom(),
    lng: lng + getRandom(),
  };
};

export const replaceUmlaut = (text: string): string => {
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

export const truncateText = (text: string, limit: number): string =>
  limit < 4 || text.length <= limit
    ? text
    : `${text.substring(0, limit - 3)}...`;

export const convertMetersToMinutes = (
  distanceInMeters: number,
  transportMode: MeansOfTransportation
) =>
  Math.round(
    distanceInMeters / (minutesToMetersMultipliers[transportMode] || 1)
  );

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

export const filterQueryParams = (
  queryParams: URLSearchParams,
  filteredValues = ["undefined", "null", ""]
): URLSearchParams => {
  const paramsToDel: string[] = [];

  queryParams.forEach((value, key) => {
    if (filteredValues.includes(value)) {
      paramsToDel.push(key);
    }
  });

  paramsToDel.forEach((key) => {
    queryParams.delete(key);
  });

  return queryParams;
};

export const replaceValInObj = (
  obj: object,
  origVal: unknown,
  newVal: unknown
): object => {
  Object.entries(obj).forEach(([key, value]) => {
    if (!!value && typeof value === "object") {
      replaceValInObj(value, origVal, newVal);
      return;
    }

    if (value === origVal) {
      Object.assign(obj, { [key]: newVal });
    }
  });

  return obj;
};

// requires a higher TS version to avoid errors
// @ts-ignore
export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delayInMs = 250
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn(...args);
    }, delayInMs);
  };
};

// left for possible future usage
export const applyClassMixins = (derivedCtor: any, constructors: any[]) => {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
};

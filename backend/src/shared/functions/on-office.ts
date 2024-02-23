export const getOnOfficeSortedMapData = (data: unknown): unknown => {
  if (!Array.isArray(data) && typeof data !== 'object') {
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
  skippedKeys?: string[],
): string => {
  // ".replace(/%2B/g, "+")" hack is needed because of the OnOffice query string decoding
  let queryString = '';

  for (const [key, value] of data) {
    if (Array.isArray(value)) {
      value.every((valueElement, i) => {
        if (typeof valueElement === 'object') {
          queryString += queryString ? '&' : '';
          queryString += `${buildOnOfficeQueryString([
            [[`${key}[${i}]`], valueElement],
          ])}`;

          return true;
        }

        queryString += queryString ? '&' : '';
        queryString += `${encodeURIComponent(
          `${key}[${i}]`,
        )}=${encodeURIComponent(valueElement).replace(/%2B/g, '+')}`;

        return true;
      });

      continue;
    }

    if (value instanceof Map) {
      for (const [valueKey, valueValue] of value) {
        if (typeof valueValue === 'object') {
          queryString += queryString ? '&' : '';
          queryString += `${buildOnOfficeQueryString([
            [[`${key}[${valueKey}]`], valueValue],
          ])}`;

          continue;
        }

        queryString += queryString ? '&' : '';
        queryString += `${encodeURIComponent(
          `${key}[${valueKey}]`,
        )}=${encodeURIComponent(value.get(valueKey)).replace(/%2B/g, '+')}`;
      }

      continue;
    }

    queryString += queryString ? '&' : '';

    if (skippedKeys?.includes(key)) {
      queryString += `${key}=${value}`.replace(/%2B/g, '+');
      continue;
    }

    queryString += `${new URLSearchParams([[key, value]])}`.replace(
      /%2B/g,
      '+',
    );
  }

  return queryString;
};

export const parseOnOfficeFloat = (value?: string): number | undefined =>
  value ? parseFloat(value.replace('.', '').replace(',', '.')) : undefined;

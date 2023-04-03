import { parse } from 'csv-parse';

import { ApiCoordinates } from '@area-butler-types/types';

export const getRawPriceValue = (priceValue: string): string =>
  priceValue.replace('.', '');

export const getPriceValueWithVat = (priceValue: string): string =>
  `${Math.round(+priceValue * 119) / 100}`;

export const getGrossPriceValue = (price: string | number): number => {
  const priceValue = Number(price);

  if (typeof priceValue !== 'number') {
    throw new Error('Price is not a numeric value!');
  }

  return Math.round(priceValue * 119) / 100;
};

export const parseCsv = async (
  csvFile: Express.Multer.File,
  delimiter = ',',
  fromLine = 2, // to remove column names
  chunkSize = 1000,
): Promise<Array<unknown[]>> => {
  const records: Array<unknown[]> = [[]];
  const parser = parse(csvFile.buffer, { delimiter, fromLine });
  let i = 0;

  for await (const record of parser) {
    if (chunkSize > 0 && records[i].length === chunkSize) {
      i += 1;
      records[i] = [];
    }

    records[i].push(record);
  }

  return records;
};

export const convertStringToNumber = (value: string): number => {
  const parsedValue = parseFloat(value);

  return isFinite(parsedValue) ? parsedValue : undefined;
};

export const checkAnyStringIsEmpty = (...texts: string[]) =>
  texts.some((text) => !text || text === '');

export const getImageTypeFromFileType = (fileType: string): string => {
  switch (fileType) {
    case 'png': {
      return 'image/png';
    }

    case 'jpeg':
    case 'jpg': {
      return 'image/jpeg';
    }

    case 'svg': {
      return 'image/svg+xml';
    }

    case 'gif': {
      return 'image/gif';
    }
  }
};

export const degreesToRadians = (degrees: number): number =>
  degrees * (Math.PI / 180.0);

// from, to - coordinates in decimal degrees (e.g. 2.89078, 12.79797)
export const distanceInMeters = (from: ApiCoordinates, to: ApiCoordinates) => {
  // Earth radius in meters
  const earthRadius = 6371000;

  const phi1 = degreesToRadians(from.lat);
  const phi2 = degreesToRadians(to.lat);

  const deltaPhi = degreesToRadians(to.lat - from.lat);
  const deltaLambda = degreesToRadians(to.lng - from.lng);

  const a =
    Math.sin(deltaPhi / 2.0) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadius * c);
};

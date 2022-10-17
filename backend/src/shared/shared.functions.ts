import { parse } from 'csv-parse';

import ApiCoordinatesDto from '../dto/api-coordinates.dto';

export const randomInt = (min = -10, max = 10) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomizeCoordinates = ({
  lat,
  lng,
}: ApiCoordinatesDto): ApiCoordinatesDto => {
  const d1 = randomInt() / 10000;
  const d2 = randomInt() / 10000;
  return {
    lat: lat + d1,
    lng: lng + d2,
  };
};

export const getRawPriceValue = (priceValue: string) =>
  priceValue.replace('.', '');

export const getPriceValueWithVat = (priceValue: string) =>
  `${Math.round(+priceValue * 119) / 100}`;

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

export const createChunks = (
  initialArray: unknown[],
  size = 1000,
): Array<unknown[]> =>
  Array.from(new Array(Math.ceil(initialArray.length / size)), (_, i) =>
    initialArray.slice(i * size, i * size + size),
  );

export const convertStringToNumber = (value: string): number => {
  const parsedValue = parseFloat(value);

  return isFinite(parsedValue) ? parsedValue : undefined;
};

export const checkAnyStringIsEmpty = (...texts: string[]) =>
  texts.some((text) => !text || text === '');

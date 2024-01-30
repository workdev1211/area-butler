import { UpdateQuery } from 'mongoose';

import { ApiCoordinates } from '@area-butler-types/types';
import { configService } from '../config/config.service';

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

export const createDirectLink = (token: string): string =>
  `${configService.getBaseAppUrl()}/embed?token=${token}`;

export const getProcUpdateQuery = <T = object>(
  updateData: T,
): UpdateQuery<T> => {
  const updateQuery: UpdateQuery<T> = {
    $set: updateData,
    $unset: {},
  };

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateQuery.$unset[key] = 1;
    }
  });

  return updateQuery;
};

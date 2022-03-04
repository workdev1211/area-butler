import { ApiCoordinates } from '@area-butler-types/types';

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

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

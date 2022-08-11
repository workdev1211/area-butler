import { ApiRealEstateCost } from "../../../shared/types/real-estate";

export const getRealEstateCost = ({
  minPrice,
  price,
}: ApiRealEstateCost): string => {
  let cost = `${price?.amount} ${price?.currency}`;

  if (minPrice && price) {
    cost = `ab ${minPrice.amount} ${minPrice.currency} bis ${price.amount} ${price.currency}`;
  }

  if (minPrice && !price) {
    cost = `ab ${minPrice.amount} ${minPrice.currency}`;
  }

  return cost;
};

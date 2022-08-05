import { ApiRealEstateCost } from "../../../shared/types/real-estate";

export const getRealEstateCost = ({
  minPrice,
  maxPrice,
}: ApiRealEstateCost): string => {
  let cost = `${maxPrice?.amount} ${maxPrice?.currency}`;

  if (minPrice && maxPrice) {
    cost = `ab ${minPrice.amount} ${minPrice.currency} bis ${maxPrice.amount} ${maxPrice.currency}`;
  }

  if (minPrice && !maxPrice) {
    cost = `ab ${minPrice.amount} ${minPrice.currency}`;
  }

  return cost;
};

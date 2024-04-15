import {
  ApiRealEstateCost,
  ApiRealEstateListing,
} from "../../../shared/types/real-estate";
import { realEstAllTextStatus } from "../../../shared/constants/real-estate";
import { ApiSearchResultSnapshotConfig } from "../../../shared/types/types";

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

export const filterRealEstates = (
  config?: ApiSearchResultSnapshotConfig,
  realEstates?: ApiRealEstateListing[]
): ApiRealEstateListing[] => {
  if (!config) {
    return realEstates || [];
  }

  if (!realEstates) {
    return [];
  }

  const { realEstateStatus, realEstateStatus2 } = config;

  return realEstateStatus || realEstateStatus2
    ? realEstates.filter(({ name, status, status2 }) => {
        const filter1 = realEstateStatus
          ? realEstateStatus === realEstAllTextStatus ||
            status === realEstateStatus
          : true;

        const filter2 = realEstateStatus2
          ? realEstateStatus2 === realEstAllTextStatus ||
            status2 === realEstateStatus2
          : true;

        return filter1 && filter2;
      })
    : realEstates;
};

import {
  ApiRealEstateCost,
  ApiRealEstateListing,
} from "../../../shared/types/real-estate";
import { realEstAllTextStatus } from "../../../shared/constants/real-estate";
import { IFilterRealEstProps } from "./real-estate.types";

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

export const filterRealEstates = ({
  config,
  location,
  realEstates,
}: IFilterRealEstProps): ApiRealEstateListing[] => {
  if (!config) {
    return realEstates || [];
  }

  if (!realEstates) {
    return [];
  }

  const { realEstateStatus, realEstateStatus2 } = config;

  return location || realEstateStatus || realEstateStatus2
    ? realEstates.filter(
        ({ coordinates: { lat, lng }, name, status, status2 }) => {
          const locationFilter = location
            ? location.lat !== lat || location.lng !== lng
            : true;

          const statusFilter = realEstateStatus
            ? realEstateStatus === realEstAllTextStatus ||
              status === realEstateStatus
            : true;

          const status2Filter = realEstateStatus2
            ? realEstateStatus2 === realEstAllTextStatus ||
              status2 === realEstateStatus2
            : true;

          return locationFilter && statusFilter && status2Filter;
        }
      )
    : realEstates;
};

import { useHttp } from "./http";
import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from "../../../shared/types/real-estate";

export const useRealEstateData = () => {
  const { get } = useHttp();

  const fetchRealEstates = async (
    realEstateStatus?: ApiRealEstateStatusEnum
  ): Promise<ApiRealEstateListing[]> => {
    let url = "/api/real-estate-listing/listings";

    if (realEstateStatus) {
      url += `?status=${realEstateStatus}`;
    }

    return (await get<ApiRealEstateListing[]>(url)).data;
  };

  return { fetchRealEstates };
};

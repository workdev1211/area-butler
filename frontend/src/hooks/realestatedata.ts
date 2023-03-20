import { useHttp } from "./http";
import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from "../../../shared/types/real-estate";

export const useRealEstateData = () => {
  const { get } = useHttp();

  const fetchRealEstateByIntId = async (
    integrationId: string
  ): Promise<ApiRealEstateListing> => {
    return (
      await get<ApiRealEstateListing>(
        `/api/real-estate-listing-int?integration-id=${integrationId}`
      )
    ).data;
  };

  const fetchRealEstates = async (
    realEstateStatus?: ApiRealEstateStatusEnum
  ): Promise<ApiRealEstateListing[]> => {
    let url = "/api/real-estate-listing/listings";

    if (realEstateStatus) {
      url += `?status=${realEstateStatus}`;
    }

    return (await get<ApiRealEstateListing[]>(url)).data;
  };

  return { fetchRealEstateByIntId, fetchRealEstates };
};

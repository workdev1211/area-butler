import { useContext } from "react";

import { useHttp } from "./http";
import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";

export const useRealEstateData = () => {
  const { realEstateDispatch } = useContext(RealEstateContext);
  const { get } = useHttp();

  const fetchRealEstates = async (
    realEstateStatus = ApiRealEstateStatusEnum.ALL
  ): Promise<void> => {
    let url = "/api/real-estate-listing/listings";

    if (realEstateStatus) {
      url += `?status=${realEstateStatus}`;
    }

    const realEstates = (await get<ApiRealEstateListing[]>(url)).data;

    realEstateDispatch({
      type: RealEstateActionTypes.SET_REAL_ESTATES,
      payload: realEstates,
    });
  };

  return { fetchRealEstates };
};

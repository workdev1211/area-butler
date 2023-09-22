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
import { ConfigContext } from "../context/ConfigContext";

export const useRealEstateData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { realEstateDispatch } = useContext(RealEstateContext);
  const { get } = useHttp();

  const isIntegration = !!integrationType;

  const fetchRealEstates = async (
    realEstateStatus = ApiRealEstateStatusEnum.ALL
  ): Promise<void> => {
    let url = isIntegration
      ? "/api/real-estate-listing-int/listings"
      : "/api/real-estate-listing/listings";

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

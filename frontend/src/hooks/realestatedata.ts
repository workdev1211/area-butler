import { useContext } from "react";

import { useHttp } from "./http";
import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import { ConfigContext } from "../context/ConfigContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";

export const useRealEstateData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);
  const { post, get, put } = useHttp();

  const isIntegration = !!integrationType;

  const createRealEstate = async (
    realEstateData: ApiUpsertRealEstateListing
  ): Promise<ApiRealEstateListing> => {
    return (
      await post<ApiRealEstateListing, ApiUpsertRealEstateListing>(
        "/api/real-estate-listing",
        realEstateData
      )
    ).data;
  };

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

  const fetchRealEstateByIntId = async (
    integrationId: string
  ): Promise<void> => {
    const realEstate = (
      await get<ApiRealEstateListing>(
        `/api/real-estate-listing-int/listing/${integrationId}`
      )
    ).data;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: realEstate,
    });
  };

  const updateRealEstate = async (
    realEstateId: string,
    updatedData: Partial<ApiUpsertRealEstateListing>
  ): Promise<ApiRealEstateListing> => {
    return (
      await put<ApiRealEstateListing, Partial<ApiUpsertRealEstateListing>>(
        isIntegration
          ? `/api/real-estate-listing-int/${realEstateId}`
          : `/api/real-estate-listing/${realEstateId}`,
        updatedData
      )
    ).data;
  };

  return {
    createRealEstate,
    fetchRealEstates,
    fetchRealEstateByIntId,
    updateRealEstate,
  };
};

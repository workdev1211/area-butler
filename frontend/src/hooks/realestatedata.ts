import { useContext } from "react";

import { useHttp } from "./http";
import {
  ApiRealEstateListing,
  IApiRealEstateListingSchema,
  IApiRealEstStatusByUser,
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
import {
  realEstAllTextStatus,
  realEstateAllStatus,
} from "../../../shared/constants/real-estate";

export const useRealEstateData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);
  const { post, get, put } = useHttp();

  const isIntegration = !!integrationType;

  const createRealEstate = async (
    realEstateData: IApiRealEstateListingSchema
  ): Promise<ApiRealEstateListing> => {
    return (
      await post<ApiRealEstateListing, IApiRealEstateListingSchema>(
        "/api/real-estate-listing",
        realEstateData
      )
    ).data;
  };

  const fetchRealEstates = async (
    realEstateStatus: string = realEstateAllStatus
  ): Promise<void> => {
    let url = isIntegration
      ? "/api/real-estate-listing-int/listings"
      : "/api/real-estate-listing/listings";

    url += `?status=${realEstateStatus}`;
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

  const fetchRealEstStatuses = async (): Promise<IApiRealEstStatusByUser> => {
    let url = isIntegration
      ? "/api/real-estate-listing-int/status"
      : "/api/real-estate-listing/status";

    const realEstStatuses = (await get<IApiRealEstStatusByUser>(url)).data;
    realEstStatuses.status.unshift(realEstAllTextStatus);
    realEstStatuses.status2.unshift(realEstAllTextStatus);

    return realEstStatuses;
  };

  const updateRealEstate = async (
    realEstateId: string,
    updatedData: Partial<IApiRealEstateListingSchema>
  ): Promise<ApiRealEstateListing> => {
    return (
      await put<ApiRealEstateListing, Partial<IApiRealEstateListingSchema>>(
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
    fetchRealEstStatuses,
    updateRealEstate,
  };
};

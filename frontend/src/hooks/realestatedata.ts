import { useContext } from "react";

import { useHttp } from "./http";
import {
  ApiRealEstateListing,
  IApiRealEstateListingSchema,
  IApiRealEstateStatuses,
  IApiRealEstStatusByUser,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypeEnum,
  RealEstateContext,
} from "../context/RealEstateContext";
import { ConfigContext } from "../context/ConfigContext";
import {
  realEstAllTextStatus,
  realEstateAllStatus,
} from "../../../shared/constants/real-estate";
import { replaceValInObj } from "../../../shared/functions/shared.functions";

interface IFetchRealEstParams {
  isForceFetch?: boolean;
  statuses?: IApiRealEstateStatuses;
}

export const useRealEstateData = () => {
  const { integrationType } = useContext(ConfigContext);
  const {
    realEstateState: { isListingsFetched, listings },
    realEstateDispatch,
  } = useContext(RealEstateContext);
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
    params?: IFetchRealEstParams
  ): Promise<ApiRealEstateListing[]> => {
    if (!params?.isForceFetch && isListingsFetched) {
      return listings;
    }

    let url = isIntegration
      ? "/api/real-estate-listing-int/listings"
      : "/api/real-estate-listing/listings";

    if (params?.statuses) {
      url += `?status=${
        params.statuses.status || realEstateAllStatus
      }&status2=${params.statuses.status2 || realEstateAllStatus}`;
    }

    const realEstates = (await get<ApiRealEstateListing[]>(url)).data;

    realEstateDispatch({
      type: RealEstateActionTypeEnum.SET_REAL_ESTATES,
      payload: realEstates,
    });

    return realEstates;
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
        replaceValInObj(updatedData, undefined, null)
      )
    ).data;
  };

  return {
    createRealEstate,
    fetchRealEstates,
    fetchRealEstStatuses,
    updateRealEstate,
  };
};

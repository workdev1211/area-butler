import { useContext } from "react";
import * as Yup from "yup";

import { getQueryParamsAndUrl } from "../../shared/shared.functions";
import { useHttp } from "../../hooks/http";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { RequestStatusTypesEnum } from "../../../../shared/types/types";
import { IIntegrationHandleLogin } from "../../../../shared/types/integration";
import {
  IApiPropstackLoginQueryParams,
  IApiPropstackLoginReq,
} from "../../../../shared/types/propstack";
import { IApiIntUserLoginRes } from "../../../../shared/types/integration-user";

const loginQueryParamsSchema = Yup.object({
  apiKey: Yup.string().required(),
  propertyId: Yup.string().required(),
});

export const usePropstackLogin = () => {
  const { userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const { post } = useHttp();

  const handleLogin = async (): Promise<IIntegrationHandleLogin> => {
    const queryParamsAndUrl =
      getQueryParamsAndUrl<IApiPropstackLoginQueryParams>();

    if (!queryParamsAndUrl) {
      return { requestStatus: RequestStatusTypesEnum.FAILURE };
    }

    await loginQueryParamsSchema.validate(queryParamsAndUrl.queryParams);

    return performLogin(queryParamsAndUrl.queryParams);
  };

  const performLogin = async ({
    apiKey,
    propertyId,
  }: IApiPropstackLoginQueryParams): Promise<IIntegrationHandleLogin> => {
    const response: IIntegrationHandleLogin = {
      requestStatus: RequestStatusTypesEnum.SUCCESS,
    };

    try {
      const loginRes = (
        await post<IApiIntUserLoginRes, IApiPropstackLoginReq>(
          "/api/propstack/login",
          { realEstateId: +propertyId },
          { Authorization: `AccessToken ${apiKey}` }
        )
      ).data;

      dispatchContextData(loginRes);
    } catch (e: any) {
      console.error("Verification error: ", e);
      response.requestStatus = RequestStatusTypesEnum.FAILURE;
      response.message = e.response?.data?.message;
    }

    return response;
  };

  const dispatchContextData = ({
    integrationUserId,
    accessToken,
    config,
    isChild,
    realEstate,
    // availProdContingents,
    latestSnapshot,
  }: IApiIntUserLoginRes): void => {
    userDispatch({
      type: UserActionTypes.SET_INTEGRATION_USER,
      payload: {
        integrationUserId,
        accessToken,
        config,
        isChild,
        // availProdContingents,
      },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: realEstate.address },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: { ...realEstate.coordinates },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: realEstate,
    });

    if (!latestSnapshot) {
      return;
    }

    // TODO add other important snapshot context data
    searchContextDispatch({
      type: SearchContextActionTypes.SET_SNAPSHOT_ID,
      payload: latestSnapshot.id,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: latestSnapshot.snapshot.transportationParams,
    });
  };

  return { handleLogin };
};

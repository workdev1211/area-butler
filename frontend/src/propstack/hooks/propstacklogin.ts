import { useContext } from "react";
import * as Yup from "yup";
import { SchemaOf } from "yup";

import { getQueryParamsAndUrl } from "../../shared/shared.functions";
import { useHttp } from "../../hooks/http";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { ResultStatusEnum } from "../../../../shared/types/types";
import { IIntegrationHandleLogin } from "../../../../shared/types/integration";
import {
  IApiPropstackLoginQueryParams,
  PropstackTextFieldTypeEnum,
} from "../../../../shared/types/propstack";
import { IApiIntUserLoginRes } from "../../../../shared/types/integration-user";

const loginQueryParamsSchema: SchemaOf<IApiPropstackLoginQueryParams> =
  Yup.object({
    apiKey: Yup.string().required(),
    propertyId: Yup.string().matches(/^\d+$/).required(),
    shopId: Yup.string().matches(/^\d+$/).required(),
    brokerId: Yup.string().matches(/^\d+$/).required(),
    teamId: Yup.string().matches(/^\d+$/).optional(),
    textFieldType: Yup.mixed()
      .oneOf(Object.values(PropstackTextFieldTypeEnum))
      .optional(),
  });

export const usePropstackLogin = () => {
  const { userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const { post } = useHttp();

  const handlePropstackLogin = async (): Promise<IIntegrationHandleLogin> => {
    const queryParamsAndUrl =
      getQueryParamsAndUrl<IApiPropstackLoginQueryParams>();

    if (!queryParamsAndUrl) {
      return { requestStatus: ResultStatusEnum.FAILURE };
    }

    try {
      await loginQueryParamsSchema.validate(queryParamsAndUrl.queryParams);
    } catch (e) {
      console.error(e);
      return { requestStatus: ResultStatusEnum.FAILURE };
    }

    return performLogin(queryParamsAndUrl.queryParams);
  };

  const performLogin = async ({
    apiKey,
    ...loginData
  }: IApiPropstackLoginQueryParams): Promise<IIntegrationHandleLogin> => {
    const response: IIntegrationHandleLogin = {
      requestStatus: ResultStatusEnum.SUCCESS,
    };

    try {
      const loginRes = (
        await post<
          IApiIntUserLoginRes,
          Omit<IApiPropstackLoginQueryParams, "apiKey">
        >("/api/propstack/login", loginData, {
          Authorization: `AccessToken ${apiKey}`,
        })
      ).data;

      dispatchContextData(loginRes);
    } catch (e: any) {
      console.error("Verification error: ", e);
      response.requestStatus = ResultStatusEnum.FAILURE;
      response.message = e.response?.data?.message;
    }

    return response;
  };

  const dispatchContextData = ({
    accessToken,
    availProdContingents,
    config,
    integrationUserId,
    isChild,
    latestSnapshot,
    openAiQueryType,
    realEstate,
    subscription,
  }: IApiIntUserLoginRes): void => {
    userDispatch({
      type: UserActionTypes.SET_INTEGRATION_USER,
      payload: {
        accessToken,
        availProdContingents,
        config,
        integrationUserId,
        isChild,
        subscription,
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

    searchContextDispatch({
      type: SearchContextActionTypes.SET_OPEN_AI_QUERY_TYPE,
      payload: openAiQueryType,
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

  return { handlePropstackLogin };
};

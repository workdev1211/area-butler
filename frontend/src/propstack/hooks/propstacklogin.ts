import { useContext } from "react";

import { useTranslation } from "react-i18next";

import * as Yup from "yup";

import { getQueryParamsAndUrl } from "../../shared/shared.functions";
import { useHttp } from "../../hooks/http";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { ResultStatusEnum } from "../../../../shared/types/types";
import {
  IApiPropstackLoginQueryParams,
  PropstackActionTypeEnum,
  PropstackFieldNameEnum,
} from "../../../../shared/types/propstack";
import { IApiIntUserLoginRes } from "../../../../shared/types/integration-user";
import { ILoginStatus } from "../../shared/shared.types";

const loginQueryParamsSchema: Yup.ObjectSchema<IApiPropstackLoginQueryParams> =
  Yup.object({
    apiKey: Yup.string().required(),
    propertyId: Yup.string().matches(/^\d+$/).required(),
    shopId: Yup.string().matches(/^\d+$/).required(),
    brokerId: Yup.string().matches(/^\d+$/).required(),
    teamId: Yup.string().matches(/^\d+$/),
    target: Yup.mixed<PropstackActionTypeEnum>().oneOf(
      Object.values(PropstackActionTypeEnum)
    ),
    fieldName: Yup.mixed<PropstackFieldNameEnum>().oneOf(
      Object.values(PropstackFieldNameEnum)
    ),
  });

export const usePropstackLogin = () => {
  const { i18n } = useTranslation();
  const { userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const { post } = useHttp();

  const handlePropstackLogin = async (): Promise<ILoginStatus> => {
    const queryParamsAndUrl =
      getQueryParamsAndUrl<IApiPropstackLoginQueryParams>();

    if (!queryParamsAndUrl) {
      return { requestStatus: ResultStatusEnum.FAILURE };
    }

    try {
      await loginQueryParamsSchema.validate(queryParamsAndUrl.queryParams);
    } catch (e) {
      console.error("Validation error:", e);
      console.debug(queryParamsAndUrl);
      return { requestStatus: ResultStatusEnum.FAILURE };
    }

    return performLogin(queryParamsAndUrl.queryParams);
  };

  const performLogin = async ({
    apiKey,
    ...loginData
  }: IApiPropstackLoginQueryParams): Promise<ILoginStatus> => {
    const response: ILoginStatus = {
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

      await dispatchContextData(loginRes);
    } catch (e: any) {
      console.error("Login error: ", e);
      response.requestStatus = ResultStatusEnum.FAILURE;
      response.message = e.response?.data?.message;
    }

    return response;
  };

  const dispatchContextData = async ({
    accessToken,
    availProdContingents,
    config,
    integrationUserId,
    isChild,
    latestSnapshot,
    openAiQueryType,
    realEstate,
    subscription,
  }: IApiIntUserLoginRes): Promise<void> => {
    await i18n.changeLanguage(config.language);
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

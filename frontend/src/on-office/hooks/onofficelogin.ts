import { useContext } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

import { getQueryParamsAndUrl } from "../../shared/shared.functions";
import {
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeConfirmOrderQueryParams,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeLoginReq,
  OnOfficeLoginActionTypesEnum,
  TApiOnOfficeConfirmOrderRes,
} from "../../../../shared/types/on-office";
import { useHttp } from "../../hooks/http";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { ResultStatusEnum } from "../../../../shared/types/types";
import {
  IOnOfficeLoginStatus,
  IQueryParamsAndUrl,
} from "../../shared/shared.types";
import { IApiIntUserLoginRes } from "../../../../shared/types/integration-user";

const loginQueryParamsSchema = Yup.object({
  apiClaim: Yup.string().required(),
  customerName: Yup.string().required(),
  customerWebId: Yup.string().required(),
  parameterCacheId: Yup.string().required(),
  timestamp: Yup.string().required(),
  userId: Yup.string().required(),
  estateId: Yup.string().required(),
  signature: Yup.string().required(),
  groupId: Yup.string(),
  imageIds: Yup.string(),
});

const confirmOrderSchema = Yup.object({
  message: Yup.string(),
  signature: Yup.string().required(),
  status: Yup.string()
    .oneOf(Object.values(ApiOnOfficeTransactionStatusesEnum))
    .required(),
  timestamp: Yup.string().required(),
  errorCodes: Yup.string(),
  transactionid: Yup.string(),
  referenceid: Yup.string(),
  accessToken: Yup.string().required(),
  integrationId: Yup.string().required(),
  products: Yup.string().required(),
});

export const useOnOfficeLogin = () => {
  const { i18n } = useTranslation();
  const { userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const { post } = useHttp();

  const handleOnOfficeLogin = async (): Promise<IOnOfficeLoginStatus> => {
    const queryParamsAndUrl = getQueryParamsAndUrl();

    if (!queryParamsAndUrl) {
      return { requestStatus: ResultStatusEnum.FAILURE };
    }

    try {
      if (
        "products" in
        (
          queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>
        ).queryParams
      ) {
        await confirmOrderSchema
          .validate(queryParamsAndUrl.queryParams)
          .catch((e) => {
            console.error("Validation error:", e);
            console.debug(queryParamsAndUrl);
          });

        return confirmOrder(
          queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>
        );
      }

      if (
        "customerWebId" in
        (queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>)
          .queryParams
      ) {
        await loginQueryParamsSchema
          .validate(queryParamsAndUrl.queryParams)
          .catch((e) => {
            console.error("Validation error:", e);
            console.debug(queryParamsAndUrl);
          });

        return performLogin(
          queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>
        );
      }
    } catch {}

    return { requestStatus: ResultStatusEnum.FAILURE };
  };

  const performLogin = async ({
    queryParams,
    url,
  }: IQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>): Promise<IOnOfficeLoginStatus> => {
    const loginReq: IApiOnOfficeLoginReq = {
      url,
      onOfficeQueryParams: queryParams,
    };

    const response: IOnOfficeLoginStatus = {
      requestStatus: ResultStatusEnum.SUCCESS,
      actionType: OnOfficeLoginActionTypesEnum.PERFORM_LOGIN,
    };

    try {
      const loginRes = (
        await post<IApiIntUserLoginRes>("/api/on-office/login", loginReq)
      ).data;

      await dispatchContextData(loginRes);
    } catch (e: any) {
      console.error("Login error: ", e);
      response.requestStatus = ResultStatusEnum.FAILURE;
      response.message = e.response?.data?.message;
    }

    return response;
  };

  const confirmOrder = async ({
    queryParams,
    url,
  }: IQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>): Promise<IOnOfficeLoginStatus> => {
    const confirmOrderReq: IApiOnOfficeConfirmOrderReq = {
      url,
      onOfficeQueryParams: queryParams,
    };

    const response: IOnOfficeLoginStatus = {
      requestStatus: ResultStatusEnum.SUCCESS,
      actionType: OnOfficeLoginActionTypesEnum.CONFIRM_ORDER,
    };

    try {
      const confirmOrderRes = (
        await post<TApiOnOfficeConfirmOrderRes, IApiOnOfficeConfirmOrderReq>(
          "/api/on-office/confirm-order",
          confirmOrderReq
        )
      ).data;

      if ("message" in confirmOrderRes) {
        console.error("Order confirmation error: ", confirmOrderRes.message);
        response.requestStatus = ResultStatusEnum.FAILURE;
        response.message = confirmOrderRes.message;

        return response;
      }

      await dispatchContextData(confirmOrderRes);
    } catch (e) {
      console.error("Order confirmation error: ", e);
      response.requestStatus = ResultStatusEnum.FAILURE;
    }

    return response;
  };

  const dispatchContextData = async ({
    integrationUser,
    latestSnapshot,
    realEstate,
  }: IApiIntUserLoginRes): Promise<void> => {
    await i18n.changeLanguage(integrationUser.config.language);

    userDispatch({
      type: UserActionTypes.SET_INTEGRATION_USER,
      payload: integrationUser,
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

  return { handleOnOfficeLogin };
};

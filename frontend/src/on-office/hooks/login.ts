import { useContext } from "react";
import * as Yup from "yup";

import { getQueryParamsAndUrl } from "../../shared/shared.functions";
import {
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeConfirmOrderQueryParams,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeLoginReq,
  IApiOnOfficeLoginRes,
  IOnOfficeHandleLogin,
  OnOfficeLoginActionTypesEnum,
  TApiOnOfficeConfirmOrderRes,
} from "../../../../shared/types/on-office";
import { useHttp } from "../../hooks/http";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { RequestStatusTypesEnum } from "../../../../shared/types/types";
import { IQueryParamsAndUrl } from "../../shared/shared.types";

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

export const useLogin = () => {
  const { userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const { post } = useHttp();

  const handleLogin = async (): Promise<IOnOfficeHandleLogin> => {
    const queryParamsAndUrl = getQueryParamsAndUrl();

    if (!queryParamsAndUrl) {
      return { requestStatus: RequestStatusTypesEnum.FAILURE };
    }

    try {
      await loginQueryParamsSchema.validate(queryParamsAndUrl.queryParams);

      return performLogin(
        queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>
      );
    } catch {}

    try {
      await confirmOrderSchema.validate(queryParamsAndUrl.queryParams);

      return confirmOrder(
        queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>
      );
    } catch {}

    return { requestStatus: RequestStatusTypesEnum.FAILURE };
  };

  const performLogin = async ({
    queryParams,
    url,
  }: IQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>): Promise<IOnOfficeHandleLogin> => {
    const loginReq: IApiOnOfficeLoginReq = {
      url,
      onOfficeQueryParams: queryParams,
    };

    const response: IOnOfficeHandleLogin = {
      requestStatus: RequestStatusTypesEnum.SUCCESS,
      actionType: OnOfficeLoginActionTypesEnum.PERFORM_LOGIN,
    };

    try {
      const loginRes = (
        await post<IApiOnOfficeLoginRes>("/api/on-office/login", loginReq)
      ).data;

      dispatchContextData(loginRes);
    } catch (e: any) {
      console.error("Verification error: ", e);
      response.requestStatus = RequestStatusTypesEnum.FAILURE;
      response.message = e.response?.data?.message;
    }

    return response;
  };

  const confirmOrder = async ({
    queryParams,
    url,
  }: IQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>): Promise<IOnOfficeHandleLogin> => {
    const confirmOrderReq: IApiOnOfficeConfirmOrderReq = {
      url,
      onOfficeQueryParams: queryParams,
    };

    const response: IOnOfficeHandleLogin = {
      requestStatus: RequestStatusTypesEnum.SUCCESS,
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
        response.requestStatus = RequestStatusTypesEnum.FAILURE;
        response.message = confirmOrderRes.message;

        return response;
      }

      dispatchContextData(confirmOrderRes);
    } catch (e) {
      console.error("Order confirmation error: ", e);
      response.requestStatus = RequestStatusTypesEnum.FAILURE;
    }

    return response;
  };

  const dispatchContextData = ({
    integrationId,
    realEstate,
    accessToken,
    config,
    availProdContingents,
    latestSnapshot,
  }: IApiOnOfficeLoginRes): void => {
    userDispatch({
      type: UserActionTypes.SET_INTEGRATION_USER,
      payload: {
        accessToken,
        availProdContingents,
        config,
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
      type: SearchContextActionTypes.SET_INTEGRATION_SNAPSHOT_ID,
      payload: latestSnapshot.id,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: latestSnapshot.snapshot.transportationParams,
    });
  };

  return { handleLogin };
};

import { useContext } from "react";
import * as Yup from "yup";

import {
  getQueryParamsAndUrl,
  toastError,
} from "../../shared/shared.functions";
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

    console.log("handleLogin", 1, queryParamsAndUrl);

    if (!queryParamsAndUrl) {
      return { requestStatus: RequestStatusTypesEnum.FAILURE };
    }

    try {
      await loginQueryParamsSchema.validate(queryParamsAndUrl.queryParams);
      const requestStatus = await performLogin(
        queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>
      );

      return {
        requestStatus,
        actionType: OnOfficeLoginActionTypesEnum.PERFORM_LOGIN,
      };
    } catch {}

    try {
      await confirmOrderSchema.validate(queryParamsAndUrl.queryParams);
      const requestStatus = await confirmOrder(
        queryParamsAndUrl as IQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>
      );

      return {
        requestStatus,
        actionType: OnOfficeLoginActionTypesEnum.CONFIRM_ORDER,
      };
    } catch {}

    return { requestStatus: RequestStatusTypesEnum.FAILURE };
  };

  const performLogin = async ({
    queryParams,
    url,
  }: IQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>): Promise<RequestStatusTypesEnum> => {
    const loginReq: IApiOnOfficeLoginReq = {
      url,
      onOfficeQueryParams: queryParams,
    };

    console.log("performLogin", 1, loginReq);

    try {
      const loginRes = (
        await post<IApiOnOfficeLoginRes>("/api/on-office/login", loginReq)
      ).data;

      dispatchContextData(loginRes);

      return RequestStatusTypesEnum.SUCCESS;
    } catch (e: any) {
      toastError("Ein Fehler ist aufgetreten!");
      console.error("Verification error: ", e);
      return RequestStatusTypesEnum.FAILURE;
    }
  };

  const confirmOrder = async ({
    queryParams,
    url,
  }: IQueryParamsAndUrl<IApiOnOfficeConfirmOrderQueryParams>): Promise<RequestStatusTypesEnum> => {
    console.log("confirmOrder", 1, url);
    const confirmOrderReq: IApiOnOfficeConfirmOrderReq = {
      url,
      onOfficeQueryParams: queryParams,
    };

    console.log("confirmOrder", 2, confirmOrderReq);

    try {
      const confirmOrderRes = (
        await post<TApiOnOfficeConfirmOrderRes, IApiOnOfficeConfirmOrderReq>(
          "/api/on-office/confirm-order",
          confirmOrderReq
        )
      ).data;

      if ("message" in confirmOrderRes) {
        toastError("Ein Fehler ist aufgetreten!");
        console.error("Order confirmation error: ", confirmOrderRes.message);
        return RequestStatusTypesEnum.FAILURE;
      }

      dispatchContextData(confirmOrderRes);

      return RequestStatusTypesEnum.SUCCESS;
    } catch (e) {
      toastError("Ein Fehler ist aufgetreten!");
      console.error("Order confirmation error: ", e);
      return RequestStatusTypesEnum.FAILURE;
    }
  };

  const dispatchContextData = ({
    integrationId,
    realEstate,
    accessToken,
    config,
    availProdContingents,
    latestSnapshot,
  }: IApiOnOfficeLoginRes): void => {
    console.log(
      "dispatchContextData",
      1,
      integrationId,
      realEstate,
      accessToken,
      config,
      availProdContingents,
      latestSnapshot
    );

    userDispatch({
      type: UserActionTypes.SET_INTEGRATION_USER,
      payload: {
        accessToken,
        availProdContingents,
        config,
      },
    });

    console.log(
      "dispatchContextData",
      2,
      Object.values(config.showTour).some((tour) => tour)
    );

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: realEstate.address },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: { ...realEstate.coordinates },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_INTEGRATION_ID,
      payload: integrationId,
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

import { useContext } from "react";
import * as Yup from "yup";

import { getQueryParamsAndUrl } from "../../shared/shared.functions";
import { useHttp } from "../../hooks/http";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { ResultStatusEnum } from "../../../../shared/types/types";
import { IIntegrationHandleLogin } from "../../../../shared/types/integration";
import {
  IApiMyVivendaLoginRes,
  IMyVivendaLoginQueryParams,
} from "../../../../shared/types/my-vivenda";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";

const loginQueryParamsSchema: Yup.Schema<IMyVivendaLoginQueryParams> =
  Yup.object({
    accessToken: Yup.string().required(),
  });

export const useMyVivendaLogin = () => {
  const { userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { post } = useHttp();

  const handleMyVivendaLogin = async (): Promise<IIntegrationHandleLogin> => {
    const queryParamsAndUrl =
      getQueryParamsAndUrl<IMyVivendaLoginQueryParams>();

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
    accessToken,
  }: IMyVivendaLoginQueryParams): Promise<IIntegrationHandleLogin> => {
    const response: IIntegrationHandleLogin = {
      requestStatus: ResultStatusEnum.SUCCESS,
    };

    try {
      const { snapshotId, user } = (
        await post<IApiMyVivendaLoginRes, IMyVivendaLoginQueryParams>(
          "/api/my-vivenda/login",
          undefined,
          {
            Authorization: `Bearer ${accessToken}`,
          }
        )
      ).data;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SNAPSHOT_ID,
        payload: snapshotId,
      });

      user.accessToken = accessToken;

      userDispatch({
        type: UserActionTypes.SET_USER,
        payload: user,
      });
    } catch (e: any) {
      console.error("Login error: ", e);
      response.requestStatus = ResultStatusEnum.FAILURE;
      response.message = e.response?.data?.message;
    }

    return response;
  };

  return { handleMyVivendaLogin };
};

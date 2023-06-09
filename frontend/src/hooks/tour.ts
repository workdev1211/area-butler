import { useContext } from "react";

import { useHttp } from "./http";
import { ApiTourNamesEnum, ApiUser } from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { UserContext } from "../context/UserContext";

export const useTour = () => {
  // TODO refactor to the useTools hook
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post } = useHttp();

  const isIntegrationUser = !!integrationUser;

  const hideTour = async (
    tour: ApiTourNamesEnum
  ): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await post<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? `/api/integration-users/me/hide-tour/${tour}`
          : `/api/users/me/hide-tour/${tour}`,
        {}
      )
    ).data;
  };

  const hideTours = async (): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await post<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? "/api/integration-users/me/hide-tour"
          : "/api/users/me/hide-tour",
        {}
      )
    ).data;
  };

  return { hideTour, hideTours };
};

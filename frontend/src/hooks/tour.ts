import { useHttp } from "./http";
import { ApiTour, ApiUser } from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";

export const useTour = (isIntegrationUser: boolean) => {
  const { post } = useHttp();

  const hideTour = async (
    tour: ApiTour
  ): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await post<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? `/api/users-integration/me/hide-tour/${tour}`
          : `/api/users/me/hide-tour/${tour}`,
        {}
      )
    ).data;
  };

  const hideTours = async (): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await post<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? "/api/users-integration/me/hide-tour"
          : "/api/users/me/hide-tour",
        {}
      )
    ).data;
  };

  return { hideTour, hideTours };
};

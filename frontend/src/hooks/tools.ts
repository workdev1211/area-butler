import { useContext } from "react";

import { ConfigContext } from "../context/ConfigContext";
import { UserContext } from "../context/UserContext";
import { ApiTourNamesEnum, ApiUser } from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { toastError } from "../shared/shared.functions";
import { useHttp } from "./http";

export const useTools = () => {
  const { systemEnv } = useContext(ConfigContext);
  const {
    userState: { user, integrationUser },
  } = useContext(UserContext);

  const { post } = useHttp();
  const isIntegrationUser = !!integrationUser;

  const createDirectLink = (token: string): string => {
    const origin = window.location.origin;

    return `${
      systemEnv !== "local"
        ? origin
        : `${origin.replace(/^(https?:\/\/\w*)(:.*)?$/, "$1")}:3002`
    }/embed?token=${token}`;
  };

  const createCodeSnippet = (token: string): string => `<iframe
  style="border: none"
  width="100%"
  height="100%"
  src="${createDirectLink(token)}"
  title="AreaButler Map Snippet"
></iframe>`;

  // TODO think about refactoring to the same frontend interface
  const getActualUser = (): ApiUser | IApiIntegrationUser => {
    if (user) {
      return user;
    }

    if (integrationUser) {
      return integrationUser;
    }

    const errorMessage = "Benutzer wurde nicht gefunden!"; // User is not found!
    toastError(errorMessage);
    throw new Error(errorMessage);
  };

  const updateUserSettings = async (settings: {
    [key: string]: string | null;
  }): Promise<void> => {
    const url = isIntegrationUser
      ? "/api/integration-users/update-config"
      : "/api/users/me/settings";

    await post<ApiUser | IApiIntegrationUser>(url, settings);
  };

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

  return {
    createDirectLink,
    createCodeSnippet,
    // move to the user data hook
    getActualUser,
    updateUserSettings,
    hideTour,
    hideTours,
  };
};

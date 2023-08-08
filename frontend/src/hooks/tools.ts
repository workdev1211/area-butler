import { useContext } from "react";

import { ConfigContext } from "../context/ConfigContext";
import { UserContext } from "../context/UserContext";
import { ApiUser } from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { toastError } from "../shared/shared.functions";

export const useTools = () => {
  const { systemEnv } = useContext(ConfigContext);
  const {
    userState: { user, integrationUser },
  } = useContext(UserContext);

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

  return { createDirectLink, createCodeSnippet, getActualUser };
};

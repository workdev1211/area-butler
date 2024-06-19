import { useContext } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { ConfigContext } from "../context/ConfigContext";
import { UserContext } from "../context/UserContext";
import {
  ApiTourNamesEnum,
  ApiUser,
  FeatureTypeEnum,
} from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { useHttp } from "./http";
import { toastDefaultError, toastError } from "../shared/shared.functions";
import { checkIsSearchNotUnlocked } from "../../../shared/functions/integration.functions";
import { SearchContext } from "../context/SearchContext";
import { useIntegrationTools } from "./integration/integrationtools";
import { defaultErrorMessage } from "../../../shared/constants/error";
import { IntlKeys } from "../i18n/keys";

export const useTools = () => {
  const { systemEnv } = useContext(ConfigContext);
  const {
    userState: { user, integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: { realEstateListing, responseConfig, responseTokens },
  } = useContext(SearchContext);

  const { patch, post } = useHttp();
  const { checkIsSubActive } = useIntegrationTools();
  const { t } = useTranslation();
  const isIntegrationUser = !!integrationUser;

  const createDirectLink = (): string => {
    const { token, isAddressShown } = getTokenParams();
    const origin = window.location.origin;

    let url = `${
      systemEnv !== "local"
        ? origin
        : `${origin.replace(/^(https?:\/\/\w*)(:.*)?$/, "$1")}:3002`
    }/embed?token=${token}`;

    if (typeof isAddressShown === "boolean") {
      url += `&isAddressShown=${isAddressShown}`;
    }

    return url;
  };

  const createCodeSnippet = (): string => `<iframe
  style="border: none"
  width="100%"
  height="100%"
  src="${createDirectLink()}"
  title="AreaButler Map Snippet"
></iframe>`;

  const checkIsFeatAvailable = (featureType: FeatureTypeEnum) => {
    if (isIntegrationUser && checkIsSubActive()) {
      return true;
    }

    switch (featureType) {
      case FeatureTypeEnum.SEARCH: {
        if (!isIntegrationUser) {
          return true;
        }

        if (!realEstateListing) {
          const errorMessage = "Der Fehler ist aufgetreten!";
          toastError(errorMessage);
          throw new Error(errorMessage);
        }

        const {
          iframeEndsAt,
          isOnePageExportActive,
          isStatsFullExportActive,
          openAiRequestQuantity,
        } = realEstateListing;

        return !checkIsSearchNotUnlocked({
          iframeEndsAt,
          isOnePageExportActive,
          isStatsFullExportActive,
          openAiRequestQuantity,
        });
      }

      case FeatureTypeEnum.OPEN_AI: {
        return !isIntegrationUser || !!realEstateListing?.openAiRequestQuantity;
      }

      case FeatureTypeEnum.IFRAME: {
        return (
          !isIntegrationUser ||
          dayjs().isBefore(realEstateListing?.iframeEndsAt)
        );
      }

      case FeatureTypeEnum.ONE_PAGE: {
        const isExportAvailForIntUser =
          isIntegrationUser && !!realEstateListing?.isOnePageExportActive;

        return (
          isExportAvailForIntUser ||
          !!user?.subscription?.config.appFeatures.fullyCustomizableExpose
        );
      }

      case FeatureTypeEnum.OTHER_EXPORT: {
        const isExportAvailForIntUser =
          isIntegrationUser && !!realEstateListing?.isStatsFullExportActive;

        return (
          isExportAvailForIntUser ||
          !!user?.subscription?.config.appFeatures.fullyCustomizableExpose
        );
      }

      case FeatureTypeEnum.STATS_DATA: {
        return isIntegrationUser
          ? !!realEstateListing?.isStatsFullExportActive
          : true;
      }

      default: {
        toastDefaultError();
        throw new Error(defaultErrorMessage);
      }
    }
  };

  // TODO think about refactoring to the same frontend interface
  const getActualUser = (): ApiUser | IApiIntegrationUser => {
    if (user) {
      return user;
    }

    if (integrationUser) {
      return integrationUser;
    }

    return {} as ApiUser;
  };

  const updateUserSettings = async (settings: {
    [key: string]: string | null;
  }): Promise<void> => {
    const url = isIntegrationUser
      ? "/api/integration-users/config"
      : "/api/users/me/settings";

    await patch<ApiUser | IApiIntegrationUser>(url, settings);
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

  const getTokenParams = (): { token: string; isAddressShown?: boolean } => {
    // left for compatibility purposes
    if (responseTokens?.token) {
      return { token: responseTokens.token };
    }

    if (responseConfig?.showAddress && responseTokens?.addressToken) {
      return { token: responseTokens.addressToken, isAddressShown: true };
    }

    if (!responseConfig?.showAddress && responseTokens?.unaddressToken) {
      return { token: responseTokens.unaddressToken, isAddressShown: false };
    }

    toastError(t(IntlKeys.integration.absentTokensError));
    throw new Error(t(IntlKeys.integration.absentTokensError));
  };

  return {
    createDirectLink,
    createCodeSnippet,
    // move all hooks below to the user data hook component
    checkIsFeatAvailable,
    getActualUser,
    updateUserSettings,
    hideTour,
    hideTours,
    getTokenParams,
  };
};

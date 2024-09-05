import { useContext } from "react";
import dayjs from "dayjs";

import { UserActionTypes, UserContext } from "../context/UserContext";
import {
  ApiTourNamesEnum,
  ApiUser,
  FeatureTypeEnum,
  TNullable,
} from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { useHttp } from "./http";
import { toastDefaultError, toastError } from "../shared/shared.functions";
import { checkIsSearchNotUnlocked } from "../../../shared/functions/integration.functions";
import { SearchContext } from "../context/SearchContext";
import { useIntegrationTools } from "./integration/integrationtools";
import { defaultErrorMessage } from "../../../shared/constants/error";
import { IApiUserConfig } from "../../../shared/types/user";

export const useUserState = () => {
  const {
    userDispatch,
    userState: { user, integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { patch, post } = useHttp();
  const { checkIsSubActive } = useIntegrationTools();
  const isIntegrationUser = !!integrationUser;

  const checkIsFeatAvailable = (featureType: FeatureTypeEnum): boolean => {
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

  const hideTour = async (
    tour: ApiTourNamesEnum
  ): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await post<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? `/api/integration-users/hide-tour/${tour}`
          : `/api/users/hide-tour/${tour}`,
        {}
      )
    ).data;
  };

  const hideTours = async (): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await post<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? "/api/integration-users/hide-tour"
          : "/api/users/hide-tour",
        {}
      )
    ).data;
  };

  const updateUserConfig = async (
    config: TNullable<Partial<IApiUserConfig>>
  ): Promise<void> => {
    const url = isIntegrationUser
      ? "/api/integration-users/config"
      : "/api/users/config";

    const user = (await patch<ApiUser | IApiIntegrationUser>(url, config)).data;

    if (isIntegrationUser) {
      userDispatch({
        type: UserActionTypes.SET_INTEGRATION_USER,
        payload: user as IApiIntegrationUser,
      });
    } else {
      userDispatch({
        type: UserActionTypes.SET_USER,
        payload: user as ApiUser,
      });
    }
  };

  return {
    checkIsFeatAvailable,
    getActualUser,
    hideTour,
    hideTours,
    updateUserConfig,
  };
};

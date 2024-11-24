import { useContext } from "react";
import dayjs from "dayjs";
import { AxiosResponse } from "axios";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "../i18n/keys";

import { UserActionTypes, UserContext } from "../context/UserContext";
import {
  ApiTourNamesEnum,
  ApiUser,
  FeatureTypeEnum,
  TNullable,
} from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { useHttp } from "./http";
import {
  toastDefaultError,
  toastError,
  toastSuccess,
} from "../shared/shared.functions";
import { checkIsSearchNotUnlocked } from "../../../shared/functions/integration.functions";
import { SearchContext } from "../context/SearchContext";
import { useIntegrationTools } from "./integration/integrationtools";
import { defaultErrorMessage } from "../../../shared/constants/error";
import { IUserConfig, TUnitedApiUser } from "../../../shared/types/user";
import {
  IApiCompanyConfig,
  IApiCompanyPreset,
} from "../../../shared/types/company";

interface IUpdateConfigParams<
  T extends IApiCompanyConfig | IUserConfig | IApiCompanyPreset
> {
  config: TNullable<Partial<T>>;
  url: string;
  errorMessage?: string;
  successMessage?: string;
  updateFunc?: (
    url: string,
    body: object
  ) => Promise<AxiosResponse<TUnitedApiUser>>;
}

export const useUserState = () => {
  const {
    userDispatch,
    userState: { user, integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { i18n, t } = useTranslation();
  const { get, patch, put } = useHttp();
  const { checkIsSubActive } = useIntegrationTools();
  const isIntegrationUser = !!integrationUser;

  const setUserContext = (currentUser: ApiUser | IApiIntegrationUser): void => {
    if ("integrationUserId" in currentUser) {
      userDispatch({
        type: UserActionTypes.SET_INTEGRATION_USER,
        payload: currentUser,
      });
    } else {
      userDispatch({
        type: UserActionTypes.SET_USER,
        payload: currentUser,
      });
    }
  };

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

  const fetchCurrentUser = async (): Promise<void> => {
    const currentUser = (
      isIntegrationUser
        ? await get<IApiIntegrationUser>("/api/integration-users/current")
        : await get<ApiUser>("/api/company-user/login")
    ).data;

    await i18n.changeLanguage(currentUser.config.language);
    setUserContext(currentUser);
  };

  const getUserForEmbedded = (): ApiUser | IApiIntegrationUser | undefined => {
    return user || integrationUser;
  };

  const getCurrentUser = (): ApiUser | IApiIntegrationUser => {
    const currentUser = getUserForEmbedded();

    if (!currentUser) {
      throw new Error(t(IntlKeys.errors.userNotFound));
    }

    return currentUser;
  };

  const hideTour = async (
    tour: ApiTourNamesEnum
  ): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await patch<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? `/api/integration-users/hide-tour/${tour}`
          : `/api/users/hide-tour/${tour}`,
        {}
      )
    ).data;
  };

  const hideTours = async (): Promise<ApiUser | IApiIntegrationUser> => {
    return (
      await patch<ApiUser | IApiIntegrationUser>(
        isIntegrationUser
          ? "/api/integration-users/hide-tour"
          : "/api/users/hide-tour",
        {}
      )
    ).data;
  };

  const updateCompanyConfig = async (
    config: TNullable<Partial<IApiCompanyConfig>>,
    successMessage?: string
  ): Promise<void> => {
    const url = isIntegrationUser
      ? "/api/company-user-int/config/company"
      : "/api/company-user/config/company";

    await updateConfig<IApiCompanyConfig>({ config, successMessage, url });
  };

  const updateUserConfig = async (
    config: TNullable<Partial<IUserConfig>>
  ): Promise<void> => {
    const url = isIntegrationUser
      ? "/api/integration-users/config"
      : "/api/users/config";

    await updateConfig<IUserConfig>({ config, url });
  };

  const updateConfig = async <
    T extends IApiCompanyConfig | IUserConfig | IApiCompanyPreset
  >({
    config,
    url,
    errorMessage = t(IntlKeys.common.errorOccurred),
    successMessage = t(IntlKeys.yourProfile.profileUpdated),
    updateFunc = patch,
  }: IUpdateConfigParams<T>): Promise<void> => {
    let currentUser: TUnitedApiUser;

    try {
      currentUser = (await updateFunc(url, config)).data;
      setUserContext(currentUser);
      toastSuccess(successMessage);
    } catch (e) {
      console.error(e);
      toastError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const upsertCompanyPreset = async (
    preset: IApiCompanyPreset
  ): Promise<void> => {
    const url = isIntegrationUser
      ? "/api/company-user-int/config/company/preset"
      : "/api/company-user/config/company/preset";

    await updateConfig({
      url,
      config: preset,
      errorMessage: t(IntlKeys.snapshotEditor.dataTab.saveAsPresetError),
      successMessage: t(IntlKeys.snapshotEditor.dataTab.saveAsPresetSuccess),
      updateFunc: put,
    });
  };

  return {
    checkIsFeatAvailable,
    fetchCurrentUser,
    getCurrentUser,
    getUserForEmbedded,
    hideTour,
    hideTours,
    updateCompanyConfig,
    updateUserConfig,
    upsertCompanyPreset,
  };
};

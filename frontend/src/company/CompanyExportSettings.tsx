import { FC, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import ImageUpload from "../components/ImageUpload";
import { UserActionTypes, UserContext } from "../context/UserContext";
import ColorPicker from "../components/ColorPicker";
import { useUserState } from "../hooks/userstate";
import { TNullable } from "../../../shared/types/types";
import { IApiCompanyConfig } from "../../../shared/types/company";
import { ConfigContext } from "../context/ConfigContext";
import { integrationNames } from "../../../shared/constants/integration";

const CompanyExportSettings: FC = () => {
  const { userDispatch } = useContext(UserContext);
  const { integrationType } = useContext(ConfigContext);

  const { t } = useTranslation();
  const { getCurrentUser } = useUserState();
  const { updateCompanyConfig } = useUserState();

  const user = getCurrentUser();
  const isIntegrationUser = "integrationUserId" in user;

  const [color, setColor] = useState(user.config.color);
  const [logo, setLogo] = useState(user.config.logo);
  const [mapIcon, setMapIcon] = useState(user.config.mapIcon);

  const updateColor = async (color?: string): Promise<void> => {
    if (isIntegrationUser) {
      return;
    }

    setColor(color);

    await updateCompanyConfig(
      { color: color || null },
      t(IntlKeys.yourProfile.primaryColorSaved)
    );

    userDispatch({
      type: UserActionTypes.SET_COLOR,
      payload: color,
    });
  };

  const updateLogo = async (logo?: string): Promise<void> => {
    if (isIntegrationUser) {
      return;
    }

    setLogo(logo);

    await updateCompanyConfig(
      { logo: logo || null },
      t(IntlKeys.yourProfile.logoSaved)
    );

    userDispatch({
      type: UserActionTypes.SET_LOGO,
      payload: logo,
    });
  };

  const updateMapIcon = async (mapIcon?: string): Promise<void> => {
    setMapIcon(mapIcon);

    await updateCompanyConfig(
      { mapIcon: mapIcon || null },
      t(IntlKeys.yourProfile.logoSaved)
    );

    userDispatch({
      type: UserActionTypes.SET_MAP_ICON,
      payload: mapIcon,
    });
  };

  const rollbackSettings = async (): Promise<void> => {
    const config: TNullable<Partial<IApiCompanyConfig>> = {
      mapIcon: null,
    };

    if (!isIntegrationUser) {
      config.color = null;
      config.logo = null;
    }

    await updateCompanyConfig(
      config,
      t(IntlKeys.yourProfile.exportSettingsReset)
    );

    if (!isIntegrationUser) {
      userDispatch({
        type: UserActionTypes.SET_COLOR,
        payload: undefined,
      });
      userDispatch({
        type: UserActionTypes.SET_LOGO,
        payload: undefined,
      });

      setColor(undefined);
      setLogo(undefined);
    }

    userDispatch({
      type: UserActionTypes.SET_MAP_ICON,
      payload: undefined,
    });

    setMapIcon(undefined);
  };

  const isResetBtnAvail = isIntegrationUser
    ? !!user.config.mapIcon
    : !!user.config.color || !!user.config.logo || !!user.config.mapIcon;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-xl">
        {t(IntlKeys.yourProfile.exportSettings)}
      </h1>

      {t(IntlKeys.yourProfile.exportSettingsDescription)}

      <ImageUpload
        image={logo}
        isDisabled={isIntegrationUser}
        onChange={updateLogo}
        uploadLabel={t(IntlKeys.yourProfile.syncWithCrm, {
          crm: integrationNames[integrationType!!],
        })}
      />

      <ImageUpload
        image={mapIcon}
        onChange={updateMapIcon}
        inputId="upload-map-icon-button"
        label={t(IntlKeys.snapshotEditor.cardsIcon)}
        uploadLabel={t(IntlKeys.snapshotEditor.uploadIcon)}
        tooltip={t(IntlKeys.yourProfile.settingAppliedTooltip)}
      />

      <ColorPicker
        color={color}
        isDisabled={isIntegrationUser}
        onChange={updateColor}
        setColor={setColor}
        tooltip={t(IntlKeys.yourProfile.settingAppliedTooltip)}
      />

      {isResetBtnAvail && (
        <button
          className="btn btn-default max-w-fit"
          onClick={rollbackSettings}
        >
          {t(IntlKeys.yourProfile.exportSettingsResetBtn)}
        </button>
      )}
    </div>
  );
};

export default CompanyExportSettings;

import { FC, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import ImageUpload from "../components/ImageUpload";
import { UserActionTypes, UserContext } from "../context/UserContext";
import ColorPicker from "../components/ColorPicker";
import { useUserState } from "../hooks/userstate";

const CompanyExportSettings: FC = () => {
  const { userDispatch } = useContext(UserContext);

  const { t } = useTranslation();
  const { getCurrentUser } = useUserState();
  const { updateCompanyConfig } = useUserState();

  const user = getCurrentUser();

  const [color, setColor] = useState<string | undefined>(
    user.config.color || ""
  );
  const [logo, setLogo] = useState<string | undefined>(user.config.logo || "");
  const [mapIcon, setMapIcon] = useState<string | undefined>(
    user.config.mapIcon || ""
  );

  const updateLogo = async (logo: string | null): Promise<void> => {
    await updateCompanyConfig({ logo }, t(IntlKeys.yourProfile.logoSaved));

    userDispatch({
      type: UserActionTypes.SET_LOGO,
      payload: logo || undefined,
    });
  };

  const updateMapIcon = async (mapIcon: string | null): Promise<void> => {
    await updateCompanyConfig({ mapIcon }, t(IntlKeys.yourProfile.logoSaved));

    userDispatch({
      type: UserActionTypes.SET_MAP_ICON,
      payload: mapIcon || undefined,
    });
  };

  const updateColor = async (color: string | null): Promise<void> => {
    await updateCompanyConfig(
      { color },
      t(IntlKeys.yourProfile.primaryColorSaved)
    );

    userDispatch({
      type: UserActionTypes.SET_COLOR,
      payload: color || undefined,
    });
  };

  const rollbackSettings = async (): Promise<void> => {
    await updateCompanyConfig(
      {
        color: null,
        logo: null,
        mapIcon: null,
      },
      t(IntlKeys.yourProfile.exportSettingsReset)
    );

    userDispatch({
      type: UserActionTypes.SET_COLOR,
      payload: undefined,
    });
    userDispatch({
      type: UserActionTypes.SET_LOGO,
      payload: undefined,
    });
    userDispatch({
      type: UserActionTypes.SET_MAP_ICON,
      payload: undefined,
    });

    setColor(undefined);
    setLogo(undefined);
    setMapIcon(undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-xl">
        {t(IntlKeys.yourProfile.exportSettings)}
      </h1>

      {t(IntlKeys.yourProfile.exportSettingsDescription)}

      <ImageUpload
        image={logo}
        setImage={setLogo}
        onChange={updateLogo}
        tooltip={t(IntlKeys.yourProfile.settingAppliedTooltip)}
      />

      <ImageUpload
        image={mapIcon}
        setImage={setMapIcon}
        onChange={updateMapIcon}
        inputId="upload-map-icon-button"
        label={t(IntlKeys.snapshotEditor.cardsIcon)}
        uploadLabel={t(IntlKeys.snapshotEditor.uploadIcon)}
      />

      <ColorPicker
        color={color}
        setColor={setColor}
        onChange={updateColor}
        tooltip={t(IntlKeys.yourProfile.settingAppliedTooltip)}
      />

      {(!!user.config.logo || !!user.config.color || !!user.config.mapIcon) && (
        <button
          className="btn btn-primary max-w-fit"
          onClick={rollbackSettings}
        >
          {t(IntlKeys.yourProfile.exportSettingsResetBtn)}
        </button>
      )}
    </div>
  );
};

export default CompanyExportSettings;

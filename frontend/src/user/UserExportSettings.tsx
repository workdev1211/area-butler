import { FC, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import ImageUpload from "../components/ImageUpload";
import { UserActionTypes, UserContext } from "../context/UserContext";
import ColorPicker from "../components/ColorPicker";
import { toastSuccess } from "../shared/shared.functions";
import { useTools } from "../hooks/tools";

const UserExportSettings: FC = () => {
  const { t } = useTranslation();
  const { userDispatch } = useContext(UserContext);

  const { getActualUser, updateUserSettings } = useTools();
  const user = getActualUser();

  const [color, setColor] = useState<string | undefined>(
    user.config.color || ""
  );
  const [logo, setLogo] = useState<string | undefined>(user.config.logo || "");
  const [mapIcon, setMapIcon] = useState<string | undefined>(
    user.config.mapIcon || ""
  );

  const updateLogo = async (logo: string | null): Promise<void> => {
    await updateUserSettings({ logo });

    userDispatch({
      type: UserActionTypes.SET_LOGO,
      payload: logo || undefined,
    });

    toastSuccess(t(IntlKeys.yourProfile.logoSaved));
  };

  const updateMapIcon = async (mapIcon: string | null): Promise<void> => {
    await updateUserSettings({ mapIcon });

    userDispatch({
      type: UserActionTypes.SET_MAP_ICON,
      payload: mapIcon || undefined,
    });

    toastSuccess(t(IntlKeys.yourProfile.logoSaved));
  };

  const updateColor = async (color: string | null): Promise<void> => {
    await updateUserSettings({ color });

    userDispatch({
      type: UserActionTypes.SET_COLOR,
      payload: color || undefined,
    });

    toastSuccess(t(IntlKeys.yourProfile.primaryColorSaved));
  };

  const rollbackSettings = async (): Promise<void> => {
    await updateUserSettings({
      color: null,
      logo: null,
      mapIcon: null,
    });

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

    toastSuccess(t(IntlKeys.yourProfile.exportSettingsReset));
  };

  return (
    <div className="mt-10">
      <h1 className="font-bold text-xl mb-2">
        {t(IntlKeys.yourProfile.exportSettings)}
      </h1>
      <p>{t(IntlKeys.yourProfile.exportSettingsDescription)}</p>
      <ImageUpload image={logo} setImage={setLogo} onChange={updateLogo} />
      <ImageUpload
        image={mapIcon}
        setImage={setMapIcon}
        onChange={updateMapIcon}
        inputId="upload-map-icon-button"
        label={t(IntlKeys.snapshotEditor.cardsIcon)}
        uploadLabel={t(IntlKeys.snapshotEditor.uploadIcon)}
      />
      <div className="mt-5">
        <ColorPicker color={color} setColor={setColor} onChange={updateColor} />
      </div>
      {(!!user.config.logo || !!user.config.color || !!user.config.mapIcon) && (
        <div className="mt-5">
          <button className="btn btn-sm btn-primary" onClick={rollbackSettings}>
            {t(IntlKeys.yourProfile.exportSettingsResetBtn)}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserExportSettings;

import React, { useContext, useState } from "react";
import ImageUpload from "../components/ImageUpload";
import { UserActionTypes, UserContext } from "../context/UserContext";
import { useHttp } from "../hooks/http";
import { ApiUser } from "../../../shared/types/types";
import ColorPicker from "../components/ColorPicker";
import { toastSuccess } from "../shared/shared.functions";

const UserExportSettings: React.FunctionComponent = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { post } = useHttp();

  const [color, setColor] = useState<string | undefined>(
    userState.user!.color || ""
  );
  const [logo, setLogo] = useState<string | undefined>(
    userState.user!.logo || ""
  );
  const [mapIcon, setMapIcon] = useState<string | undefined>(
    userState.user!.mapIcon || ""
  );

  const updateLogo = async (logo: string) => {
    userDispatch({ type: UserActionTypes.SET_LOGO, payload: logo });
    await post<ApiUser>("/api/users/me/settings", { logo });
    toastSuccess("Logo gespeichert.");
  };

  const updateMapIcon = async (mapIcon: string) => {
    userDispatch({ type: UserActionTypes.SET_MAP_ICON, payload: mapIcon });
    await post<ApiUser>("/api/users/me/settings", { mapIcon });
    toastSuccess("Logo gespeichert.");
  };

  const updateColor = async (color: string) => {
    userDispatch({ type: UserActionTypes.SET_COLOR, payload: color });
    await post<ApiUser>("/api/users/me/settings", { color });
    toastSuccess("Primärfarbe gespeichert.");
  };

  const rollbackSettings = async () => {
    const newColor = userState.user!.parentSettings?.color || undefined;
    const newLogo = userState.user!.parentSettings?.logo || undefined;
    const newMapIcon = userState.user!.parentSettings?.mapIcon || undefined;

    userDispatch({
      type: UserActionTypes.SET_COLOR,
      payload: newColor,
    });
    userDispatch({
      type: UserActionTypes.SET_LOGO,
      payload: newLogo,
    });
    userDispatch({
      type: UserActionTypes.SET_MAP_ICON,
      payload: newMapIcon,
    });

    setColor(newColor);
    setLogo(newLogo);
    setMapIcon(newMapIcon);

    await post<ApiUser>("/api/users/me/settings", {
      color: newColor || null,
      logo: newLogo || null,
      mapIcon: newMapIcon || null,
    });

    toastSuccess("Export Einstellungen zurückgesetzt.");
  };

  return (
    <div className="mt-10">
      <h1 className="font-bold text-xl mb-2">Export-Einstellungen</h1>
      <p>
        Die nachfolgenden Einstellungen verändern das enthaltene Logo und die
        verwendete Primärfarbe beim Export von Standortanalysen.
      </p>
      <ImageUpload image={logo} setImage={setLogo} onChange={updateLogo} />
      <ImageUpload
        image={mapIcon}
        setImage={setMapIcon}
        onChange={updateMapIcon}
        inputId="upload-map-icon-button"
        label="Karten Icon"
        uploadLabel="Icon hochladen"
      />
      <div className="mt-5">
        <ColorPicker color={color} setColor={setColor} onChange={updateColor} />
      </div>
      {(!!userState.user!.logo ||
        !!userState.user!.color ||
        !!userState.user!.mapIcon) && (
        <div className="mt-5">
          <button className="btn btn-sm btn-primary" onClick={rollbackSettings}>
            Export Einstellungen Zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
};

export default UserExportSettings;

import { FunctionComponent, useContext, useState } from "react";

import ImageUpload from "../components/ImageUpload";
import { UserActionTypes, UserContext } from "../context/UserContext";
import ColorPicker from "../components/ColorPicker";
import { toastSuccess } from "../shared/shared.functions";
import { useTools } from "../hooks/tools";

const UserExportSettings: FunctionComponent = () => {
  const {
    userState: { user },
    userDispatch,
  } = useContext(UserContext);

  const { updateUserSettings } = useTools();

  const [color, setColor] = useState<string | undefined>(user!.color || "");
  const [logo, setLogo] = useState<string | undefined>(user!.logo || "");
  const [mapIcon, setMapIcon] = useState<string | undefined>(
    user!.mapIcon || ""
  );

  const updateLogo = async (logo: string | null): Promise<void> => {
    await updateUserSettings({ logo });

    userDispatch({
      type: UserActionTypes.SET_LOGO,
      payload: logo || undefined,
    });

    toastSuccess("Logo gespeichert.");
  };

  const updateMapIcon = async (mapIcon: string | null): Promise<void> => {
    await updateUserSettings({ mapIcon });

    userDispatch({
      type: UserActionTypes.SET_MAP_ICON,
      payload: mapIcon || undefined,
    });

    toastSuccess("Logo gespeichert.");
  };

  const updateColor = async (color: string | null): Promise<void> => {
    await updateUserSettings({ color });

    userDispatch({
      type: UserActionTypes.SET_COLOR,
      payload: color || undefined,
    });

    toastSuccess("Primärfarbe gespeichert.");
  };

  const rollbackSettings = async (): Promise<void> => {
    const newColor = user!.parentSettings?.color;
    const newLogo = user!.parentSettings?.logo;
    const newMapIcon = user!.parentSettings?.mapIcon;

    await updateUserSettings({
      color: newColor || null,
      logo: newLogo || null,
      mapIcon: newMapIcon || null,
    });

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
      {(!!user!.logo || !!user!.color || !!user!.mapIcon) && (
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

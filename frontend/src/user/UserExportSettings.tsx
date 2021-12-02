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
  const [image, setImage] = useState<string | undefined>(userState.user!.logo || '');
  const [color, setColor] = useState<string | undefined>(userState.user!.color || '');

  const updateLogo = async (logo: string) => {
    userDispatch({ type: UserActionTypes.SET_LOGO, payload: logo });
    await post<ApiUser>("/api/users/me/settings", { logo });
    toastSuccess("Logo gespeichert.");
  };
  
  const updateColor = async (color: string) => {
    userDispatch({ type: UserActionTypes.SET_COLOR, payload: color });
    await post<ApiUser>("/api/users/me/settings", { color });
    toastSuccess("Primärfarbe gespeichert.");
  };
  
  const rollbackSettings = async () => {
    userDispatch({ type: UserActionTypes.SET_LOGO, payload: undefined });
    userDispatch({ type: UserActionTypes.SET_COLOR, payload: undefined });
    setImage(undefined);
    setColor(undefined);
    await post<ApiUser>("/api/users/me/settings", { color: null, logo: null });
    toastSuccess("Export Einstellungen zurückgesetzt.");
  }


  return (
    <div className="mt-10">
      <h1 className="font-bold text-xl mb-2">Export-Einstellungen</h1>
      <p>
        Die nachfolgenden Einstellungen verändern das enthaltene Logo und die
        verwendete Primärfarbe beim Export von Standortanalysen.
      </p>
      <ImageUpload image={image} setImage={setImage} onChange={updateLogo} />
      <div className="mt-5">
        <ColorPicker color={color} setColor={setColor} onChange={updateColor} />
      </div>
      {(!!userState.user!.logo || !!userState.user!.color) && <div className="mt-5">
        <button className="btn btn-sm btn-primary" onClick={() => rollbackSettings()}>Export Einstellungen Zurücksetzen</button>
      </div>}
    </div>
  );
};

export default UserExportSettings;

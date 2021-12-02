import React, { useContext } from "react";
import ImageUpload from "../components/ImageUpload";
import { UserActionTypes, UserContext } from "../context/UserContext";
import { useHttp } from "../hooks/http";
import { ApiUser } from "../../../shared/types/types";
import ColorPicker from "../components/ColorPicker";
import { toastSuccess } from "../shared/shared.functions";

const UserExportSettings: React.FunctionComponent = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { post } = useHttp();

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

  return (
    <div className="mt-10">
      <h1 className="font-bold text-xl mb-2">Export-Einstellungen</h1>
      <p>
        Die nachfolgenden Einstellungen verändern das enthaltene Logo und die
        verwendete Primärfarbe beim Export von Standortanalysen.
      </p>
      <ImageUpload src={userState.user!.logo} onChange={updateLogo} />
      <div className="mt-5">
        <ColorPicker value={userState.user!.color} onChange={updateColor} />
      </div>
    </div>
  );
};

export default UserExportSettings;

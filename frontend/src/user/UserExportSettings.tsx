import React, {useContext} from "react";
import ImageUpload from "../components/ImageUpload";
import {UserActions, UserContext} from "../context/UserContext";
import {useHttp} from "../hooks/http";
import {ApiUser} from "../../../shared/types/types";

const UserExportSettings: React.FunctionComponent = () => {

    const {userState, userDispatch} = useContext(UserContext);
    const {post} = useHttp();

    const updateLogo = async (logo: string) => {
        userDispatch({type: UserActions.SET_LOGO, payload: logo});
        await post<ApiUser>("/api/users/me/settings", {logo});
    }

    return (
        <div className="mt-10">
            <h1 className="font-bold text-xl mb-2">
                Export-Einstellungen
            </h1>
            <ImageUpload src={userState.user.logo} onChange={updateLogo}/>
        </div>
    )
}

export default UserExportSettings;

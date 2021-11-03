import React, {FunctionComponent, useContext, useEffect, useState,} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {UserActions, UserContext} from "context/UserContext";
import {useHttp} from "hooks/http";
import {ApiConsent, ApiUser} from "../../../shared/types/types";
import {localStorageInvitationCodeKey} from "../../../shared/constants/constants";

const Authenticated = withRouter<RouteComponentProps,
    FunctionComponent<RouteComponentProps>>(({history, children}) => {
    const {isAuthenticated} = useAuth0();

    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

    const {get, post} = useHttp();
    const {userState, userDispatch} = useContext(UserContext);


    useEffect(() => {
        setIsLoggedIn(isAuthenticated);

        if (isAuthenticated) {
            const useInvitationCode = async () => {
                const payload: ApiConsent = {inviteCode: localStorage.getItem(localStorageInvitationCodeKey)!};
                try {
                    const updatedUser = (await post<ApiUser>("/api/users/me/consent", payload))
                        .data;
                    userDispatch({type: UserActions.SET_USER, payload: updatedUser});
                    localStorage.removeItem(localStorageInvitationCodeKey);
                } catch (error) {
                    console.error(error);
                }
            }

            const fetchUser = async () => {
                const user: ApiUser = (await get<ApiUser>("/api/users/me")).data;
                userDispatch({type: UserActions.SET_USER, payload: user});
            };
            if (localStorage.getItem(localStorageInvitationCodeKey)) {
                useInvitationCode();
            } else {
                fetchUser();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, setIsLoggedIn]);

    if (!isLoggedIn || !userState.user) {
        return <></>;
    }
    return <>{children}</>;
});
export default Authenticated;

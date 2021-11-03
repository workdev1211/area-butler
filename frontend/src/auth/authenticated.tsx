import React, {FunctionComponent, useContext, useEffect, useState,} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {UserContext} from "context/UserContext";

const Authenticated = withRouter<RouteComponentProps,
    FunctionComponent<RouteComponentProps>>(({history, children}) => {
    const {isAuthenticated} = useAuth0();
    const {userState} = useContext(UserContext);
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);


    useEffect(() => {
        setIsLoggedIn(isAuthenticated);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, setIsLoggedIn]);

    if (!isLoggedIn || !userState.user) {
        return <></>;
    }
    return <>{children}</>;
});
export default Authenticated;

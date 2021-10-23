import React, { useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { withRouter } from "react-router-dom";
import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { ApiUser } from "../../../shared/types/types";

const Authenticated = withRouter(({ history, children }) => {
  const { isAuthenticated } = useAuth0();

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  const { get } = useHttp();
  const { userState, userDispatch } = useContext(UserContext);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);

    if (isAuthenticated) {
      const fetchUser = async () => {
        const user: ApiUser = (await get<ApiUser>("/api/users/me")).data;
        userDispatch({ type: UserActions.SET_USER, payload: user });
      };
      if (!userState.user) {
        fetchUser();
      }
    }
  }, [isAuthenticated, setIsLoggedIn]);

  if (!isLoggedIn) {
    return <></>;
  }
  return <>{children}</>;
});
export default Authenticated;

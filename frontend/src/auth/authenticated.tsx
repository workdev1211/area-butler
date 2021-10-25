import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { ApiUser } from "../../../shared/types/types";

interface AuthenticatedProps extends RouteComponentProps {
  forceConsentRerouting?: boolean;
}

const Authenticated = withRouter<
  AuthenticatedProps,
  FunctionComponent<AuthenticatedProps>
>(({ history, children, forceConsentRerouting = true }) => {
  const { isAuthenticated } = useAuth0();

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  const { get } = useHttp();
  const { userState, userDispatch } = useContext(UserContext);

  useEffect(() => {
    if (
      forceConsentRerouting &&
      !!userState?.user &&
      !userState?.user?.consentGiven
    ) {
      history.push("/consent");
    }
  }, [userState]);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);

    if (isAuthenticated) {
      const fetchUser = async () => {
        const user: ApiUser = (await get<ApiUser>("/api/users/me")).data;
        userDispatch({ type: UserActions.SET_USER, payload: user });
      };

      fetchUser();
    }
  }, [isAuthenticated, setIsLoggedIn]);

  if (!isLoggedIn) {
    return <></>;
  }
  return <>{children}</>;
});
export default Authenticated;

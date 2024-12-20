import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { UserContext } from "context/UserContext";
import { userProfilePath } from "../shared/shared.constants";

const pathWithoutAuth = ["/terms", "/privacy", "/impress"];

const Authenticated = withRouter<
  RouteComponentProps,
  FunctionComponent<RouteComponentProps>
>(({ history, location, children }) => {
  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const { userState } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated, setIsLoggedIn]);

  useEffect(() => {
    const verifyUserRequirements = async () => {
      const idToken = await getIdTokenClaims();
      const verifyEmailLocation = "/verify";

      if (
        idToken &&
        !idToken.email_verified &&
        location.pathname !== verifyEmailLocation
      ) {
        history.push(verifyEmailLocation);
        return;
      }

      if (
        !pathWithoutAuth.includes(location.pathname) &&
        userState?.user?.consentGiven &&
        idToken?.email_verified &&
        !userState?.user?.subscription &&
        location.pathname !== userProfilePath
      ) {
        history.push(userProfilePath);
        return;
      }
    };

    void verifyUserRequirements();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState, window.location.href]);

  if (!isLoggedIn || !userState.user) {
    return <></>;
  }

  return <>{children}</>;
});

export default Authenticated;

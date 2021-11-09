import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { UserContext } from "context/UserContext";

const Authenticated = withRouter<
  RouteComponentProps,
  FunctionComponent<RouteComponentProps>
>(({ history, children }) => {
  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const { userState } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated, setIsLoggedIn]);

  useEffect(() => {
    const chooseSubscription = async () => {
      const idToken = await getIdTokenClaims();

      if (
        !!userState?.user?.consentGiven &&
        !!idToken &&
        !!idToken.email_verified &&
        !userState?.user?.subscriptionPlan
      ) {
        history.push("/profile");
      }
    };
    chooseSubscription();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState, window.location.href]);

  if (!isLoggedIn || !userState.user) {
    return <></>;
  }
  return <>{children}</>;
});
export default Authenticated;

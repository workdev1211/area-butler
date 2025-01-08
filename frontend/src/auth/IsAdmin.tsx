import { FC, useContext, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { UserContext } from "../context/UserContext";

const IsAdmin = withRouter<RouteComponentProps, FC<RouteComponentProps>>(
  ({ history, children }) => {
    const {
      userState: { integrationUser, user },
    } = useContext(UserContext);

    const currentUser = integrationUser || user;

    useEffect(() => {
      if (!currentUser?.isAdmin) {
        history.push("/");
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, window.location.href]);

    if (!currentUser?.isAdmin) {
      return null;
    }

    return <>{children}</>;
  }
);

export default IsAdmin;

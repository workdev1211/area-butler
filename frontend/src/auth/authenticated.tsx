import React, {useEffect, useState} from 'react';
import {useAuth0} from '@auth0/auth0-react';
import {withRouter} from "react-router-dom";

const Authenticated = withRouter(({ history, children }) => {
  const {
    isAuthenticated
  } = useAuth0();

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated, setIsLoggedIn]);

  if (!isLoggedIn) {
    return <></>;
  }
  return <>{children}</>;
});
export default Authenticated;

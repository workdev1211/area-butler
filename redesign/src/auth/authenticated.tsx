import React from 'react';
import {useAuth0} from '@auth0/auth0-react';
import {withRouter} from "react-router-dom";

const Authenticated = withRouter(({ history, children }) => {
  const {
    isAuthenticated
  } = useAuth0();
  if (!isAuthenticated && history.location.pathname !== '/login') {
    // history.push('/login');
  }
  return <>{children}</>;
});
export default Authenticated;

import React, { FunctionComponent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
const  Authenticated : FunctionComponent = ({ children }) => {
  const {
    isAuthenticated, loginWithRedirect
  } = useAuth0();
  if (!isAuthenticated) {
  }
  return <>{children}</>;
}
export default Authenticated;

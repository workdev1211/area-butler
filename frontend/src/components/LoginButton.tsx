import { useAuth0 } from '@auth0/auth0-react';
import React, { FunctionComponent } from 'react';

const LoginButton: FunctionComponent = () => {
  const {
    isAuthenticated,
    loginWithRedirect,
  } = useAuth0();

  if (!isAuthenticated) {
      return <button onClick={loginWithRedirect}>Anmelden</button>
  }

  return null;
}

export default LoginButton;

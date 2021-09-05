import React, { FunctionComponent } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton : FunctionComponent = () => {
  const { isAuthenticated, logout } = useAuth0();

  if (isAuthenticated) {
    return <button
      onClick={() => {
        logout({ returnTo: window.location.origin });
      }}
    >
      Ausloggen
    </button>;
  }

  return <div></div>;
}

export default LogoutButton;

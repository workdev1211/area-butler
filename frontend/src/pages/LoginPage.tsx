import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import DefaultLayout from "../layout/defaultLayout";

export const LoginPage: React.FunctionComponent = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.push("/search");
    }
  }, [history, isAuthenticated]);

  return (
    <DefaultLayout title="Anmeldung/Registrierung" withHorizontalPadding={true}>
      <div className="pt-20 md:w-1/3 mx-auto">
        <h2>Willkommen bei Ihrem AreaButler</h2>
        <p className="pt-5">
          Bitte melden Sie sich an um den AreaButler nutzen zu können.
        </p>
        <p>
          Ein Klick auf den Button „Anmelden/Registrieren“ startet den Prozess zur Anmeldung/Registrierung beim AreaButler. 
Dieser Prozess wird von unserem Partner Auth0 unterstützt. Dem Marktführer für Sichere Anmelde- & Registrierungsprozesse.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={loginWithRedirect}
        >
          Anmelden/Registrieren
        </button>
      </div>
    </DefaultLayout>
  );
};

export default LoginPage;

import React, { useEffect } from "react";
import DefaultLayout from "../layout/defaultLayout";
import "./Auth0ConsentPage.scss";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";

const VerifyEmailPage: React.FunctionComponent = () => {
  const { getIdTokenClaims } = useAuth0();
  const history = useHistory();

  useEffect(() => {
    const validateEmailVerified = async () => {
      const idToken = await getIdTokenClaims();
      const { email_verified } = idToken;
      if (email_verified) {
        history.push("/");
      }
    };
    validateEmailVerified();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout title="Registrierung" withHorizontalPadding={true}>
      <div className="flex flex-col w-1/3 mx-auto pt-20">
        <p>
          Bitte verifizieren Sie Ihre E-Mail-Adresse, eine entsprechende E-Mail
          finden Sie in Ihrem Postfach.
        </p>
        <p>
          Sollten Sie die E-Mail nicht entdecken können, schauen Sie bitte auch
          in Ihrem Spam-Ordner nach.
        </p>
        <button
          className="btn btn-primary mt-5"
          onClick={() => window.location.reload()}
        >
          Nochmal versuchen
        </button>
      </div>
    </DefaultLayout>
  );
};

export default VerifyEmailPage;

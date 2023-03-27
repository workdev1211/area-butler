import { FunctionComponent, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";

import DefaultLayout from "../layout/defaultLayout";
import "./Auth0ConsentPage.scss";

const VerifyEmailPage: FunctionComponent = () => {
  const { getIdTokenClaims } = useAuth0();
  const history = useHistory();

  useEffect(() => {
    const validateEmailVerified = async (): Promise<void> => {
      const idToken = await getIdTokenClaims();
      const { email_verified: emailVerified } = idToken;

      if (emailVerified) {
        history.push("/");
      }
    };

    void validateEmailVerified();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout title="Registrierung" withHorizontalPadding={true}>
      <div className="flex flex-col w-1/3 mx-auto pt-20 text-justify">
        <p>
          Bitte verifizieren Sie Ihre E-Mail-Adresse, eine entsprechende E-Mail
          finden Sie in Ihrem Postfach.
        </p>
        <p>
          Sollten Sie die E-Mail nicht entdecken können, schauen Sie bitte auch
          in Ihrem Spam-Ordner nach.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={() => {
            history.go(0);
          }}
        >
          Erneut überprüfen
        </button>
      </div>
    </DefaultLayout>
  );
};

export default VerifyEmailPage;

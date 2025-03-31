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
          Please verify your email address. You will find a corresponding email in your inbox.
        </p>
        <p>
          If you cannot find the email, please also check your spam folder.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={() => {
            history.go(0);
          }}
        >
          Check again
        </button>
      </div>
    </DefaultLayout>
  );
};

export default VerifyEmailPage;

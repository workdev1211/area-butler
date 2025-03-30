import { FunctionComponent, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import DefaultLayout from "../layout/defaultLayout";

export const LoginPage: FunctionComponent = () => {
  const { isAuthenticated, loginWithRedirect, loginWithPopup } = useAuth0();
  const history = useHistory();

  console.log('* isAuthenticated : ', isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      history.push("/search");
    }
  }, [history, isAuthenticated]);

  return (
    <DefaultLayout title="Login/Register" withHorizontalPadding={true}>
      <div className="pt-20 md:w-1/3 mx-auto">
        <h2>Welcome to your AreaButler</h2>
        <p className="pt-5">
          Please log in to use AreaButler.
        </p>
        <p className="text-justify">
          Clicking the "Login / Register" button starts the AreaButler login / registration process. This process is supported by our partner Auth0, the market leader for secure login and registration processes.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={loginWithRedirect}
        >
          Login / Register
        </button>
      </div>
    </DefaultLayout>
  );
};

export default LoginPage;

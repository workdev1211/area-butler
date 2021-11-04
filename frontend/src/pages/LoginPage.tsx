import React, {useEffect} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {useAuth0} from "@auth0/auth0-react";
import {useHistory} from "react-router-dom";

export const LoginPage: React.FunctionComponent = () => {
    const {isAuthenticated, loginWithRedirect} = useAuth0();
    const history = useHistory();

    useEffect(() => {
        if (isAuthenticated) {
            history.push("/search");
        }
    }, [isAuthenticated])

    return (
        <DefaultLayout title="Anmeldung/Registrierung" withHorizontalPadding={true}>
            <div className="pt-20 md:w-1/3 mx-auto">
                <h2>Willkommen bei Ihrem Area Butler</h2>
                <p className="pt-5">Bitte melden Sie sich an, um diesen Service nutzen zu können.</p>
                <p>Ein Klick auf den nachfolgenden Button führt Sie zu der Anmeldung bzw. Registerierung bei Auth0.</p>
                <button type="button" className="btn btn-primary mt-5" onClick={loginWithRedirect}>Anmelden/Registrieren</button>
            </div>
        </DefaultLayout>
    );
};

export default LoginPage;


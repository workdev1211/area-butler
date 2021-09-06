import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {Auth0Provider} from "@auth0/auth0-react";
import {ApiConfig} from "../../shared/types/types";
import {ConfigContext} from "./context/ConfigContext";

const baseUrl = process.env.REACT_APP_BASE_URL || '';

fetch(`${baseUrl}/api/config`).then(async result => {
    const {auth, googleApiKey} = await result.json() as ApiConfig;
    ReactDOM.render(
        <React.StrictMode>
            <Auth0Provider
                domain={auth.domain}
                clientId={auth.clientId}
                redirectUri={window.location.origin}
            >
                <ConfigContext.Provider value={{
                    auth,
                    googleApiKey
                }}>
                    <App/>
                </ConfigContext.Provider>
            </Auth0Provider>
        </React.StrictMode>,
        document.getElementById("root")
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
});



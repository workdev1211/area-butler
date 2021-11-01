import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {ApiConfig} from "../../shared/types/types";
import {Auth0Provider} from "@auth0/auth0-react";
import 'assets/fonts/archia-light-webfont.eot';
import 'assets/fonts/archia-light-webfont.ttf';
import 'assets/fonts/archia-light-webfont.woff';
import 'assets/fonts/archia-light-webfont.woff2';
import 'assets/fonts/archia-regular-webfont.eot';
import 'assets/fonts/archia-regular-webfont.ttf';
import 'assets/fonts/archia-regular-webfont.woff';
import 'assets/fonts/archia-regular-webfont.woff2';
import 'assets/fonts/archia-semibold-webfont.eot';
import 'assets/fonts/archia-semibold-webfont.ttf';
import 'assets/fonts/archia-semibold-webfont.woff';
import 'assets/fonts/archia-semibold-webfont.woff2';
import { ConfigContext } from 'context/ConfigContext';

const baseUrl = process.env.REACT_APP_BASE_URL || '';

fetch(`${baseUrl}/api/config`).then(async result => {
    const {auth, googleApiKey, mapBoxAccessToken, stripeEnv, inviteCodeNeeded} = await result.json() as ApiConfig;
    ReactDOM.render(
        <React.StrictMode>
            <Auth0Provider
                domain={auth.domain}
                clientId={auth.clientId}
                redirectUri={window.location.origin}
            >
                <ConfigContext.Provider value={{
                    auth,
                    googleApiKey,
                    mapBoxAccessToken,
                    stripeEnv,
                    inviteCodeNeeded
                }}>
                    <App/>
                </ConfigContext.Provider>
            </Auth0Provider>
        </React.StrictMode>,
        document.getElementById("root")
    );
});

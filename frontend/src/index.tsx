import { StrictMode } from "react";
import { render } from "react-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter as Router } from "react-router-dom";
import { ErrorBoundary, Provider } from "@rollbar/react";
import * as Sentry from "@sentry/browser";

import "./index.scss";

import "assets/fonts/archia-light-webfont.eot";
import "assets/fonts/archia-light-webfont.ttf";
import "assets/fonts/archia-light-webfont.woff";
import "assets/fonts/archia-light-webfont.woff2";
import "assets/fonts/archia-regular-webfont.eot";
import "assets/fonts/archia-regular-webfont.ttf";
import "assets/fonts/archia-regular-webfont.woff";
import "assets/fonts/archia-regular-webfont.woff2";
import "assets/fonts/archia-semibold-webfont.eot";
import "assets/fonts/archia-semibold-webfont.ttf";
import "assets/fonts/archia-semibold-webfont.woff";
import "assets/fonts/archia-semibold-webfont.woff2";

import App from "./App";
import { ApiConfig } from "../../shared/types/types";
import { ConfigContext } from "context/ConfigContext";
import { UserContextProvider } from "./context/UserContext";

import 'i18n';

const baseUrl = process.env.REACT_APP_BASE_URL || "";

console.log('* base_url : ', baseUrl);

fetch(`${baseUrl}/api/config`).then(async (result) => {
  const {
    auth,
    googleApiKey,
    mapBoxAccessToken,
    systemEnv,
    stripeEnv,
    rollbarConfig,
    paypalClientId,
    sentry,
  } = (await result.json()) as ApiConfig;

  console.log('* auth : ', auth);
  console.log('* googleApiKey : ', googleApiKey);
  console.log('* mapBoxAccessToken : ', mapBoxAccessToken);
  console.log('* systemEnv : ', systemEnv);
  console.log('* stripeEnv : ', stripeEnv);
  console.log('* rollbarConfig : ', rollbarConfig);
  console.log('* paypalClientId : ', paypalClientId);
  console.log('* sentry : ', sentry);

  Sentry.init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    tracesSampleRate: 1.0,
    debug: true,
    attachStacktrace: true,
    autoSessionTracking: false,
  });

  render(
    <Provider config={rollbarConfig}>
      <StrictMode>
        <ErrorBoundary>
          <Auth0Provider
            domain={auth!.domain}
            clientId={auth!.clientId}
            redirectUri={window.location.origin}
          >
            <ConfigContext.Provider
              value={{
                auth,
                googleApiKey,
                mapBoxAccessToken,
                systemEnv,
                stripeEnv,
                rollbarConfig,
                paypalClientId,
                sentry,
              }}
            >
              <UserContextProvider>
                <Router>
                  <App />
                </Router>
              </UserContextProvider>
            </ConfigContext.Provider>
          </Auth0Provider>
        </ErrorBoundary>
      </StrictMode>
    </Provider>,
    document.getElementById("root")
  );
});

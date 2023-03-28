import { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

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

import { UserContextProvider } from "./context/UserContext";
import { SearchContextProvider } from "./context/SearchContext";
import { ConfigContext } from "context/ConfigContext";
import { ApiConfig } from "../../shared/types/types";
import OnOfficeContainer from "./on-office/OnOfficeContainer";
import { RealEstateContextProvider } from "./context/RealEstateContext";
import { IntegrationTypesEnum } from "../../shared/types/integration";

const baseUrl = process.env.REACT_APP_BASE_URL || "";

fetch(`${baseUrl}/api/config`).then(async (result) => {
  const { googleApiKey, mapBoxAccessToken, systemEnv, stripeEnv, sentry } =
    (await result.json()) as ApiConfig;

  render(
    <StrictMode>
      <ConfigContext.Provider
        value={{
          googleApiKey,
          mapBoxAccessToken,
          systemEnv,
          stripeEnv,
          integrationType: IntegrationTypesEnum.ON_OFFICE,
          sentry,
        }}
      >
        <UserContextProvider>
          <SearchContextProvider>
            <RealEstateContextProvider>
              <Router basename="/on-office">
                <OnOfficeContainer />
              </Router>
            </RealEstateContextProvider>
          </SearchContextProvider>
        </UserContextProvider>
      </ConfigContext.Provider>
    </StrictMode>,
    document.getElementById("root")
  );
});

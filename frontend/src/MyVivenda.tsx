import { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.scss";
import "./MyVivenda.scss";

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
import { RealEstateContextProvider } from "./context/RealEstateContext";
import { IntegrationTypesEnum } from "../../shared/types/integration";
import { PotentialCustomerContextProvider } from "./context/PotentialCustomerContext";
import { CachingContextProvider } from "./context/CachingContext";
import MyVivendaContainer from "./my-vivenda/MyVivendaContainer";

const baseUrl = process.env.REACT_APP_BASE_URL || "";

fetch(`${baseUrl}/api/config`).then(async (result): Promise<void> => {
  const { googleApiKey, mapBoxAccessToken, systemEnv, stripeEnv, sentry } =
    (await result.json()) as ApiConfig;

  render(
    <StrictMode>
      <ConfigContext.Provider
        value={{
          googleApiKey,
          mapBoxAccessToken,
          sentry,
          stripeEnv,
          systemEnv,
          integrationType: IntegrationTypesEnum.MY_VIVENDA,
        }}
      >
        <UserContextProvider>
          <SearchContextProvider>
            <RealEstateContextProvider>
              <PotentialCustomerContextProvider>
                <CachingContextProvider>
                  <Router basename="/my-vivenda">
                    <MyVivendaContainer />
                  </Router>
                </CachingContextProvider>
              </PotentialCustomerContextProvider>
            </RealEstateContextProvider>
          </SearchContextProvider>
        </UserContextProvider>
      </ConfigContext.Provider>
    </StrictMode>,
    document.getElementById("root")
  );
});

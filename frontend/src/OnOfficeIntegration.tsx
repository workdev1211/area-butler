import { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

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

import { SearchContextProvider } from "./context/SearchContext";
import { OnOfficeContextProvider } from "./context/OnOfficeContext";
import OnOfficeContainer from "./on-office/integration/OnOfficeContainer";
import LoginPage from "./on-office/integration/pages/LoginPage";
import ConfirmOrderPage from "./on-office/integration/pages/ConfirmOrderPage";
import ProductPage from "./on-office/integration/pages/ProductPage";

render(
  <StrictMode>
    <Router basename="/on-office">
      <OnOfficeContextProvider>
        <SearchContextProvider>
          <Switch>
            <Route path="/confirm-order">
              <ConfirmOrderPage />
            </Route>
            <Route path="/map">
              <OnOfficeContainer />
            </Route>
            <Route path="/products">
              <ProductPage />
            </Route>
            <Route path="/">
              <LoginPage />
            </Route>
          </Switch>
        </SearchContextProvider>
      </OnOfficeContextProvider>
    </Router>
  </StrictMode>,
  document.getElementById("root")
);

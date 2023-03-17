import { lazy, StrictMode, Suspense } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
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

export const LoadingMessage = () => <div>Seite wird geladen...</div>;

const SearchParamsPage = lazy(() => import("../src/pages/SearchParamsPage"));
const LoginPage = lazy(() => import("./on-office/pages/LoginPage"));
const ProductPage = lazy(() => import("./on-office/pages/ProductPage"));
const ConfirmOrderPage = lazy(
  () => import("./on-office/pages/ConfirmOrderPage")
);
const OpenAiPage = lazy(() => import("./on-office/pages/OpenAiPage"));

render(
  <StrictMode>
    <Suspense fallback={<LoadingMessage />}>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Router basename="/on-office">
        <OnOfficeContextProvider>
          <SearchContextProvider>
            <Switch>
              <Route path="/open-ai">
                <OpenAiPage />
              </Route>
              <Route path="/confirm-order">
                <ConfirmOrderPage />
              </Route>
              <Route path="/products">
                <ProductPage />
              </Route>
              <Route path="/search">
                <SearchParamsPage />
              </Route>
              <Route path="/">
                <LoginPage />
              </Route>
            </Switch>
          </SearchContextProvider>
        </OnOfficeContextProvider>
      </Router>
    </Suspense>
  </StrictMode>,
  document.getElementById("root")
);

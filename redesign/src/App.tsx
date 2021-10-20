import React, { lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Nav from "./layout/Nav";
import Footer from "./layout/Footer";
import { SearchContextProvider } from "./context/SearchContext";
import Authenticated from "./auth/authenticated";
import { PotentialCustomerContextProvider } from "./context/PotentialCustomerContext";

const LoadingMessage = () => <div>Seite wird geladen...</div>;

const ImpressPage = lazy(() => import("./pages/ImpressPage"));

const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

const SearchParamsPage = lazy(() => import("./pages/SearchParamsPage"));

const SearchResultPage = lazy(() => import("./pages/SearchResultPage"));

const PotentialCustomersPage = lazy(
  () => import("./pages/PotentialCustomersPage")
);

const PotentialCustomerPage = lazy(
  () => import("./pages/PotentialCustomerPage")
);

const CustomerQuestionnairePage = lazy(
    () => import("./pages/CustomerQuestionnairePage")
);

function App() {
  return (
    <Router>
      <div className="app">
        <Nav />
        <Suspense fallback={<LoadingMessage />}>
          <PotentialCustomerContextProvider>
            <SearchContextProvider>
              <Switch>
                <Route path="/impress">
                  <ImpressPage />
                </Route>
                <Route path="/privacy">
                  <PrivacyPage />
                </Route>
                <Route path="/search-result">
                  <Authenticated>
                    <SearchResultPage />
                  </Authenticated>
                </Route>
                <Route path="/potential-customers/:customerId">
                  <Authenticated>
                    <PotentialCustomerPage />
                  </Authenticated>
                </Route>
                <Route path="/potential-customers">
                  <Authenticated>
                    <PotentialCustomersPage />
                  </Authenticated>
                </Route>
                  <Route path="/questionnaire/:inputToken">
                      <CustomerQuestionnairePage />
                  </Route>
                <Route path="/">
                  <Authenticated>
                    <SearchParamsPage />
                  </Authenticated>
                </Route>
              </Switch>
            </SearchContextProvider>
          </PotentialCustomerContextProvider>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

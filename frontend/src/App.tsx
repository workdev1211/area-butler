import Authenticated from "auth/authenticated";
import FormModal, { ModalConfig } from "components/FormModal";
import { PotentialCustomerContextProvider } from "context/PotentialCustomerContext";
import { RealEstateListingContextProvider } from "context/RealEstateListingContext";
import { FeedbackFormHandler } from "feedback/FeedbackFormHandler";
import { PotentialCustomersPage } from "pages/PotentialCustomersPage";
import { RealEstateListingPage } from "pages/RealEstateListingPage";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Nav from "./nav/Nav";
import Start from "./pages/Start";
import { SearchContextProvider } from "./context/SearchContext";
import { CustomerQuestionnaire } from "pages/CustomerQuestionnaire";
import ImpressPage from "./pages/ImpressPage";
import Footer from "./footer/Footer";

function App() {
  const feedbackModalConfig: ModalConfig = {
    buttonTitle: "Feedback",
    buttonStyle:
      "fixed -bottom-60 -right-5 mb-96 z-20 rotate-90 bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold h-8 px-2 rounded",
    modalTitle: "Feedback abgeben",
  };

  return (
    <RealEstateListingContextProvider>
      <PotentialCustomerContextProvider>
        <Router>
          <Authenticated>
            <FormModal modalConfig={feedbackModalConfig}>
              <FeedbackFormHandler></FeedbackFormHandler>
            </FormModal>
          </Authenticated>
          <div className="app">
            <Nav />
            <Switch>
              <Route path="/questionnaire">
                <CustomerQuestionnaire></CustomerQuestionnaire>
              </Route>
              <Route path="/listings">
                <Authenticated>
                  <RealEstateListingPage />
                </Authenticated>
              </Route>
              <Route path="/potential-customers">
                <Authenticated>
                  <PotentialCustomersPage />
                </Authenticated>
              </Route>
              <Route path="/impress">
                <ImpressPage />
              </Route>
              <Route path="/">
                <Authenticated>
                  <SearchContextProvider>
                    <Start />
                  </SearchContextProvider>
                </Authenticated>
              </Route>
            </Switch>
            <Footer />
          </div>
        </Router>
      </PotentialCustomerContextProvider>
    </RealEstateListingContextProvider>
  );
}

export default App;

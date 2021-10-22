import React, {lazy, Suspense} from "react";
import "./App.css";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Nav from "./layout/Nav";
import Footer from "./layout/Footer";
import {SearchContextProvider} from "./context/SearchContext";
import Authenticated from "./auth/authenticated";
import {PotentialCustomerContextProvider} from "./context/PotentialCustomerContext";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {RealEstateContextProvider} from "./context/RealEstateContext";
import FormModal, { ModalConfig } from "components/FormModal";
import FeedbackFormHandler from "feedback/FeedbackFormHandler";

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

const RealEstatesPage = lazy(
    () => import("./pages/RealEstatesPage")
);

const RealEstatePage = lazy(
    () => import("./pages/RealEstatePage")
);

const feedbackModalConfig: ModalConfig = {
    buttonTitle: "?",
    buttonStyle:
      "fixed -bottom-80 right-2 mb-96 z-900 btn-sm rounded-full font-bold border bg-white text-primary border-primary hover:bg-primary hover:text-white",
    modalTitle: "Feedback abgeben",
  };

function App() {
    return (
        <Router>
            <div className="app">
                <Authenticated>
                    <FormModal modalConfig={feedbackModalConfig}>
                        <FeedbackFormHandler></FeedbackFormHandler>
                    </FormModal>
                </Authenticated>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover/>
                <ToastContainer/>
                <Nav/>
                <Suspense fallback={<LoadingMessage/>}>
                    <PotentialCustomerContextProvider>
                        <RealEstateContextProvider>
                            <SearchContextProvider>
                                <Switch>
                                    <Route path="/impress">
                                        <ImpressPage/>
                                    </Route>
                                    <Route path="/privacy">
                                        <PrivacyPage/>
                                    </Route>
                                    <Route path="/search-result">
                                        <Authenticated>
                                            <SearchResultPage/>
                                        </Authenticated>
                                    </Route>
                                    <Route path="/potential-customers/:customerId">
                                        <Authenticated>
                                            <PotentialCustomerPage/>
                                        </Authenticated>
                                    </Route>
                                    <Route path="/potential-customers">
                                        <Authenticated>
                                            <PotentialCustomersPage/>
                                        </Authenticated>
                                    </Route>
                                    <Route path="/questionnaire/:inputToken">
                                        <CustomerQuestionnairePage/>
                                    </Route>
                                    <Route path="/real-estates/:realEstateId">
                                        <Authenticated>
                                            <RealEstatePage/>
                                        </Authenticated>
                                    </Route>
                                    <Route path="/real-estates">
                                        <Authenticated>
                                            <RealEstatesPage/>
                                        </Authenticated>
                                    </Route>
                                    <Route path="/">
                                        <Authenticated>
                                            <SearchParamsPage/>
                                        </Authenticated>
                                    </Route>
                                </Switch>
                            </SearchContextProvider>
                        </RealEstateContextProvider>
                    </PotentialCustomerContextProvider>
                </Suspense>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;

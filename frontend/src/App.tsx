import React, {lazy, Suspense, useEffect} from "react";
import "./App.css";
import {BrowserRouter as Router, Route, Switch, useLocation} from "react-router-dom";
import Nav from "./layout/Nav";
import Footer from "./layout/Footer";
import {SearchContextProvider} from "./context/SearchContext";
import Authenticated from "./auth/authenticated";
import {PotentialCustomerContextProvider} from "./context/PotentialCustomerContext";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {RealEstateContextProvider} from "./context/RealEstateContext";
import FormModal, {ModalConfig} from "components/FormModal";
import FeedbackFormHandler from "feedback/FeedbackFormHandler";
import {UserContextProvider} from "context/UserContext";
import UpgradeSubscriptionHandlerContainer from "user/UpgradeSubscriptionHandlerContainer";
import {useAuth0} from "@auth0/auth0-react";
import {ApiConsent, ApiUser} from "../../shared/types/types";
import {localStorageInvitationCodeKey} from "../../shared/constants/constants";
import {useHttp} from "./hooks/http";

const LoadingMessage = () => <div>Seite wird geladen...</div>;

const ImpressPage = lazy(() => import("./pages/ImpressPage"));

const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

const TermsPage = lazy(() => import("./pages/TermsPage"));

const Auth0ConsentPage = lazy(() => import("./pages/Auth0ConsentPage"));

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

const RealEstatesPage = lazy(() => import("./pages/RealEstatesPage"));

const RealEstatePage = lazy(() => import("./pages/RealEstatePage"));

const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

const CallbackPage = lazy(() => import("./pages/CallbackPage"));

const feedbackModalConfig: ModalConfig = {
    buttonTitle: "?",
    buttonStyle:
        "fixed -bottom-80 right-2 mb-96 z-900 btn-sm rounded-full font-bold border bg-white text-primary border-primary hover:bg-primary hover:text-white",
    modalTitle: "Feedback abgeben",
};

const ScrollToTop: React.FunctionComponent = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    const {isAuthenticated} = useAuth0();
    const {post} = useHttp();

    useEffect(() => {
        if (isAuthenticated) {
            const consumeInvitationCode = async () => {
                const payload: ApiConsent = {inviteCode: localStorage.getItem(localStorageInvitationCodeKey)!};
                try {
                    await post<ApiUser>("/api/users/me/consent", payload);
                    localStorage.removeItem(localStorageInvitationCodeKey);
                } catch (error) {
                    console.error(error);
                }
            }

            if (localStorage.getItem(localStorageInvitationCodeKey)) {
                consumeInvitationCode();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    return (
        <Router>
            <ScrollToTop />
            <div className="app">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <ToastContainer/>
                <Suspense fallback={<LoadingMessage/>}>
                    <UserContextProvider>
                        <Nav/>
                        <Authenticated>
                            <UpgradeSubscriptionHandlerContainer />
                            <FormModal modalConfig={feedbackModalConfig}>
                                <FeedbackFormHandler/>
                            </FormModal>
                        </Authenticated>
                        <PotentialCustomerContextProvider>
                            <RealEstateContextProvider>
                                <SearchContextProvider>
                                    <Switch>
                                        <Route path="/register">
                                            <Auth0ConsentPage/>
                                        </Route>
                                        <Route path="/profile">
                                            <Authenticated>
                                                <UserProfilePage/>
                                            </Authenticated>
                                        </Route>
                                        <Route path="/callback">
                                            <Authenticated>
                                                <CallbackPage />
                                            </Authenticated>
                                        </Route>
                                        <Route path="/impress">
                                            <ImpressPage/>
                                        </Route>
                                        <Route path="/privacy">
                                            <PrivacyPage/>
                                        </Route>
                                        <Route path="/terms">
                                            <TermsPage/>
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
                    </UserContextProvider>
                </Suspense>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;

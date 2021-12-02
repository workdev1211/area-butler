import React, { lazy, Suspense, useContext, useEffect } from "react";
import "./App.css";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import Nav from "./layout/Nav";
import Footer from "./layout/Footer";
import { SearchContextProvider } from "./context/SearchContext";
import Authenticated from "./auth/authenticated";
import { PotentialCustomerContextProvider } from "./context/PotentialCustomerContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RealEstateContextProvider } from "./context/RealEstateContext";
import FormModal, { ModalConfig } from "components/FormModal";
import FeedbackFormHandler from "feedback/FeedbackFormHandler";
import { UserActionTypes, UserContext } from "context/UserContext";
import UpgradeSubscriptionHandlerContainer from "user/UpgradeSubscriptionHandlerContainer";
import { useAuth0 } from "@auth0/auth0-react";
import { ApiConsent, ApiUser, ApiUserRequests } from "../../shared/types/types";
import { localStorageInvitationCodeKey } from "../../shared/constants/constants";
import { useHttp } from "./hooks/http";

const LoadingMessage = () => <div>Seite wird geladen...</div>;

const LoginPage = lazy(() => import("./pages/LoginPage"));

const ImpressPage = lazy(() => import("./pages/ImpressPage"));

const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

const TermsPage = lazy(() => import("./pages/TermsPage"));

const Auth0ConsentPage = lazy(() => import("./pages/Auth0ConsentPage"));

const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

const SearchParamsPage = lazy(() => import("./pages/SearchParamsPage"));

const SearchResultPage = lazy(() => import("./pages/SearchResultPage"));

const PotentialCustomersPage = lazy(() =>
  import("./pages/PotentialCustomersPage")
);

const PotentialCustomerPage = lazy(() =>
  import("./pages/PotentialCustomerPage")
);

const CustomerQuestionnairePage = lazy(() =>
  import("./pages/CustomerQuestionnairePage")
);

const RealEstatesPage = lazy(() => import("./pages/RealEstatesPage"));

const RealEstatePage = lazy(() => import("./pages/RealEstatePage"));

const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

const CallbackPage = lazy(() => import("./pages/CallbackPage"));

const feedbackModalConfig: ModalConfig = {
  buttonTitle: "?",
  buttonStyle:
    "fixed -bottom-80 right-2 mb-96 z-900 btn-sm rounded-full font-bold border bg-white text-primary border-primary hover:bg-primary hover:text-white",
  modalTitle: "Hilfe & Feedback"
};

const ScrollToTop: React.FunctionComponent = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const { get, post } = useHttp();
  const history = useHistory();

  const { userDispatch } = useContext(UserContext);

  useEffect(() => {
    if (isAuthenticated) {
      const validateEmailVerified = async () => {
        const idToken = await getIdTokenClaims();
        const { email_verified } = idToken;
        if (!email_verified) {
          history.push("/verify");
        }
      };
      const consumeInvitationCode = async () => {
        const payload: ApiConsent = {
          inviteCode: localStorage.getItem(localStorageInvitationCodeKey)!
        };
        try {
          const updatedUser = (
            await post<ApiUser>("/api/users/me/consent", payload)
          ).data;
          userDispatch({
            type: UserActionTypes.SET_USER,
            payload: updatedUser
          });
          localStorage.removeItem(localStorageInvitationCodeKey);
        } catch (error) {
          console.error(error);
        }
      };
      const fetchUser = async () => {
        const user: ApiUser = (await get<ApiUser>("/api/users/me")).data;
        userDispatch({ type: UserActionTypes.SET_USER, payload: user });
        const latestUserRequests: ApiUserRequests = (
          await get<ApiUserRequests>("/api/location/latest-user-requests")
        ).data;
        userDispatch({
          type: UserActionTypes.SET_LATEST_USER_REQUESTS,
          payload: latestUserRequests
        });
      };

      validateEmailVerified();
      if (localStorage.getItem(localStorageInvitationCodeKey)) {
        consumeInvitationCode();
      } else {
        fetchUser();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <>
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
        <ToastContainer />
        <Suspense fallback={<LoadingMessage />}>
          <Nav />
          <Authenticated>
            <UpgradeSubscriptionHandlerContainer />
            <FormModal modalConfig={feedbackModalConfig}>
              <FeedbackFormHandler />
            </FormModal>
          </Authenticated>
          <PotentialCustomerContextProvider>
            <RealEstateContextProvider>
              <SearchContextProvider>
                <Switch>
                  <Route path="/register">
                    <Auth0ConsentPage />
                  </Route>
                  <Route path="/verify">
                    <Authenticated>
                      <VerifyEmailPage />
                    </Authenticated>
                  </Route>
                  <Route path="/profile">
                    <Authenticated>
                      <UserProfilePage />
                    </Authenticated>
                  </Route>
                  <Route path="/callback">
                    <Authenticated>
                      <CallbackPage />
                    </Authenticated>
                  </Route>
                  <Route path="/impress">
                    <ImpressPage />
                  </Route>
                  <Route path="/privacy">
                    <PrivacyPage />
                  </Route>
                  <Route path="/terms">
                    <TermsPage />
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
                  <Route path="/real-estates/:realEstateId">
                    <Authenticated>
                      <RealEstatePage />
                    </Authenticated>
                  </Route>
                  <Route path="/real-estates">
                    <Authenticated>
                      <RealEstatesPage />
                    </Authenticated>
                  </Route>
                  <Route path="/search">
                    <Authenticated>
                      <SearchParamsPage />
                    </Authenticated>
                  </Route>
                  <Route path="/">
                    <LoginPage />
                  </Route>
                </Switch>
              </SearchContextProvider>
            </RealEstateContextProvider>
          </PotentialCustomerContextProvider>
        </Suspense>
        <Footer />
      </div>
    </>
  );
}

export default App;

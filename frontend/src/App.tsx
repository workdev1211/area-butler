import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  // useState,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import * as Sentry from "@sentry/browser";

import "react-toastify/dist/ReactToastify.css";
import "./App.scss";

import { UserActionTypes, UserContext } from "context/UserContext";
import UpgradeSubscriptionHandlerContainer from "user/UpgradeSubscriptionHandlerContainer";
import { localStorageConsentGivenKey } from "../../shared/constants/constants";
import { ApiUser, ApiUserRequests } from "../../shared/types/types";
import Authenticated from "./auth/Authenticated";
import { PotentialCustomerContextProvider } from "./context/PotentialCustomerContext";
import { RealEstateContextProvider } from "./context/RealEstateContext";
import { SearchContextProvider } from "./context/SearchContext";
import { useHttp } from "./hooks/http";
import Footer from "./layout/Footer";
import Nav from "./layout/Nav";
import { ConfigContext } from "./context/ConfigContext";
import { commonPaypalOptions } from "./shared/shared.constants";
import { CachingContextProvider } from "./context/CachingContext";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackModal from "./components/FeedbackModal";
// import MaintenanceModal from "./components/MaintenanceModal";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_SENTRY_ENV,
  tracesSampleRate: 1.0,
  debug: true,
  attachStacktrace: true,
  autoSessionTracking: false,
});

const LoadingMessage = () => <div>Seite wird geladen...</div>;

const LoginPage = lazy(() => import("./pages/LoginPage"));

const ImpressPage = lazy(() => import("./pages/ImpressPage"));

const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

const TermsPage = lazy(() => import("./pages/TermsPage"));

const Auth0ConsentPage = lazy(() => import("./pages/Auth0ConsentPage"));

const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

const SearchParamsPage = lazy(() => import("./pages/SearchParamsPage"));

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

const SnippetEditorPage = lazy(() => import("./pages/SnippetEditorPage"));

const MapSnippetsPage = lazy(() => import("./pages/MapSnippetsPage"));

// const maintenanceKey = "is-seen-maintenance-2023-02-23";

function App() {
  const { paypalClientId } = useContext(ConfigContext);
  const { userDispatch } = useContext(UserContext);

  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const { get, post } = useHttp();
  const history = useHistory();
  const { pathname } = useLocation();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  // const [isSeenMaintenance, setIsSeenMaintenance] = useState(
  //   window.localStorage.getItem(maintenanceKey) === "true"
  // );

  const initialPaypalOptions = {
    "client-id": paypalClientId || "test",
    // for Order payments
    // intent: "capture",
    // for Subscription payments
    intent: "subscription",
    // for Subscription payments
    vault: true,
    ...commonPaypalOptions,
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const validateEmailVerified = async (): Promise<void> => {
      const idToken = await getIdTokenClaims();
      const { email_verified: emailVerified } = idToken;

      if (!emailVerified) {
        history.push("/verify");
      }
    };

    const consumeConsentGiven = async () => {
      try {
        const updatedUser = (await post<ApiUser>("/api/users/me/consent", {}))
          .data;

        userDispatch({
          type: UserActionTypes.SET_USER,
          payload: updatedUser,
        });

        localStorage.removeItem(localStorageConsentGivenKey);
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
        payload: latestUserRequests,
      });
    };

    void validateEmailVerified();

    if (localStorage.getItem(localStorageConsentGivenKey) === "true") {
      void consumeConsentGiven();
    } else {
      void fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <>
      <ScrollToTop />
      <div>{process.env.REACT_APP_SENTRY_DSN_FE}</div>
      <div className="app">
        {/*{isAuthenticated && !isSeenMaintenance && (*/}
        {/*  <MaintenanceModal*/}
        {/*    onClose={() => {*/}
        {/*      window.localStorage.setItem(maintenanceKey, "true");*/}
        {/*      setIsSeenMaintenance(true);*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <div className="flex flex-col gap-3">*/}
        {/*      <div className="text-justify">*/}
        {/*        <div>Sehr geehrte Kundin,</div>*/}
        {/*        <div>sehr geehrter Kunde,</div>*/}
        {/*        <div>*/}
        {/*          am Donnerstag, den 23.02.2023, werden wir in der Zeit zwischen*/}
        {/*          22:00 Uhr und 23:59 Uhr Wartungsarbeiten an unserem Server und*/}
        {/*          der App durchführen. Innerhalb des o.g. Zeitraums wird es zu*/}
        {/*          einer Nicht-Erreichbarkeit der von Ihnen gebuchten Produkte*/}
        {/*          kommen, die voraussichtlich 20 Minuten betragen wird. Wir sind*/}
        {/*          bemüht, die Wartungsarbeiten schnellstmöglich abzuschließen.*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*      <div>Vielen Dank für Ihr Verständnis.</div>*/}
        {/*      <div>Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.</div>*/}
        {/*      <div>*/}
        {/*        <div>Mit freundlichem Gruß aus Hamburg,</div>*/}
        {/*        <div>Ihr Team AreaButler</div>*/}
        {/*        <a*/}
        {/*          href="mailto:info@areabutler.de"*/}
        {/*          className="text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*        >*/}
        {/*          info@areabutler.de*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </MaintenanceModal>*/}
        {/*)}*/}
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
        <Suspense fallback={<LoadingMessage />}>
          <Nav />
          <Authenticated>
            <UpgradeSubscriptionHandlerContainer />
            {!["snippet-editor"].includes(currentPath) && <FeedbackModal />}
          </Authenticated>
          <PayPalScriptProvider options={initialPaypalOptions}>
            <PotentialCustomerContextProvider>
              <RealEstateContextProvider>
                <SearchContextProvider>
                  <CachingContextProvider>
                    <Switch>
                      <Route path="/register">
                        <Auth0ConsentPage />
                      </Route>
                      <Route path="/verify">
                        <Authenticated>
                          <VerifyEmailPage />
                        </Authenticated>
                      </Route>
                      {/*Subscription Selection*/}
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
                      <Route path="/snippet-editor/:snapshotId">
                        <Authenticated>
                          <SnippetEditorPage />
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
                      <Route path="/map-snippets">
                        <Authenticated>
                          <MapSnippetsPage />
                        </Authenticated>
                      </Route>
                      <Route path="/">
                        <LoginPage />
                      </Route>
                    </Switch>
                  </CachingContextProvider>
                </SearchContextProvider>
              </RealEstateContextProvider>
            </PotentialCustomerContextProvider>
          </PayPalScriptProvider>
        </Suspense>
        <Footer />
      </div>
    </>
  );
}

export default App;

import { lazy, Suspense, useContext, useEffect } from "react";

// import { useTranslation } from "react-i18next";

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
import { ApiUser, ApiLastLocSearches } from "../../shared/types/types";
import Authenticated from "./auth/Authenticated";
import { PotentialCustomerContextProvider } from "./context/PotentialCustomerContext";
import { RealEstateContextProvider } from "./context/RealEstateContext";
import { SearchContextProvider } from "./context/SearchContext";
import { useHttp } from "./hooks/http";
import Footer from "./layout/Footer";
import Nav from "./layout/Nav";
import { ConfigContext } from "./context/ConfigContext";
import {
  commonPaypalOptions,
  companyProfilePath,
  snapshotEditorPath,
  userProfilePath,
} from "./shared/shared.constants";
import { CachingContextProvider } from "./context/CachingContext";
import ScrollToTop from "./components/ScrollToTop";
import { LoadingMessage } from "./components/Loading";
// import InformationModal from "./components/InformationModal";
import BrowserWarningModal from "./components/BrowserWarningModal";
import SupportLink from "./components/SupportLink";
import { useUserState } from "./hooks/userstate";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_SENTRY_ENV,
  tracesSampleRate: 1.0,
  debug: true,
  attachStacktrace: true,
  autoSessionTracking: false,
});

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

const SnapshotEditorPage = lazy(() => import("./pages/SnapshotEditorPage"));

const MapSnapshotsPage = lazy(() => import("./pages/MapSnapshotsPage"));

const CompanyProfilePage = lazy(() => import("./pages/CompanyProfilePage"));

// const infoKey = "is-seen-info-2024-08-07";

function App() {
  const { paypalClientId } = useContext(ConfigContext);
  const {
    userDispatch,
    userState: { user },
  } = useContext(UserContext);

  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const { get, post } = useHttp();
  const history = useHistory();
  const { pathname } = useLocation();
  const { fetchCurrentUser } = useUserState();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  // const [isSeenInfo, setIsSeenInfo] = useState(
  //   window.localStorage.getItem(infoKey) === "true"
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

    const consumeConsentGiven = async (): Promise<void> => {
      try {
        const updatedUser = (
          await post<ApiUser>("/api/company-user/consent", {})
        ).data;

        userDispatch({
          type: UserActionTypes.SET_USER,
          payload: updatedUser,
        });

        localStorage.removeItem(localStorageConsentGivenKey);
      } catch (error) {
        console.error(error);
      }
    };

    const getUserData = async (): Promise<void> => {
      await fetchCurrentUser();

      const { locationSearches } = (
        await get<ApiLastLocSearches>("/api/location/last-loc-searches")
      ).data;

      userDispatch({
        type: UserActionTypes.SET_LAST_LOC_SEARCHES,
        payload: locationSearches,
      });
    };

    void validateEmailVerified();

    if (localStorage.getItem(localStorageConsentGivenKey) === "true") {
      void consumeConsentGiven();
    } else {
      void getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <>
      <ScrollToTop />
      <div>{process.env.REACT_APP_SENTRY_DSN_FE}</div>
      <div className="app">
        {isAuthenticated && <BrowserWarningModal />}
        {/*{isAuthenticated && !isSeenInfo && (*/}
        {/*  <InformationModal*/}
        {/*    title="Neue Funktionen im AreaButler"*/}
        {/*    contentWidthRem={30}*/}
        {/*    onClose={(isDontShowAgain: boolean) => {*/}
        {/*      if (isDontShowAgain) {*/}
        {/*        window.localStorage.setItem(infoKey, "true");*/}
        {/*      }*/}

        {/*      setIsSeenInfo(true);*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <div className="flex flex-col gap-3">*/}
        {/*      <div className="text-justify">*/}
        {/*        <div>Sehr geehrte Kundin,</div>*/}
        {/*        <div>sehr geehrter Kunde,</div>*/}
        {/*        <div>*/}
        {/*          in diesem Video stellen wir Ihnen die neuen Funktionen des*/}
        {/*          AreaButlers vor.*/}
        {/*        </div>*/}
        {/*      </div>*/}

        {/*      <iframe*/}
        {/*        className="w-[30rem] h-[16.875rem]"*/}
        {/*        title="whats-new"*/}
        {/*        src="https://www.youtube.com/embed/JIxzv8leFq0?controls=0"*/}
        {/*      />*/}

        {/*      <div className="text-justify">*/}
        {/*        <div>Zusammengefasst:</div>*/}
        {/*        <ul className="list-disc pl-4">*/}
        {/*          <li>Visuelle Überarbeitung der Navigation auf der Karte</li>*/}
        {/*          <li>Häufig genutzte Funktionen auf der ersten Seite</li>*/}
        {/*          <li>*/}
        {/*            Verbesserte und neue KI Prompts (Mikro- und Makrolage,*/}
        {/*            Stadtteiltexte und Socialmedia Posts)*/}
        {/*          </li>*/}
        {/*          <li>*/}
        {/*            Screenshotmodal mit Möglichkeit zum Zuschneiden,*/}
        {/*            Herunterladen und/oder ans CRM senden*/}
        {/*          </li>*/}
        {/*        </ul>*/}
        {/*      </div>*/}

        {/*      <div>*/}
        {/*        <div>Wir freuen uns auf euer Feedback!</div>*/}
        {/*        <div>Mit freundlichen Grüßen</div>*/}
        {/*        <div>Das AreaButler-Team</div>*/}
        {/*        <a*/}
        {/*          href="mailto:info@areabutler.de"*/}
        {/*          className="text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*        >*/}
        {/*          info@areabutler.de*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </InformationModal>*/}
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
            {snapshotEditorPath !== currentPath && <SupportLink />}
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

                      <Route path={userProfilePath}>
                        <Authenticated>
                          <UserProfilePage />
                        </Authenticated>
                      </Route>

                      {/* Subscription Selection */}
                      {user?.isAdmin && (
                        <Route path={companyProfilePath}>
                          <Authenticated>
                            <CompanyProfilePage />
                          </Authenticated>
                        </Route>
                      )}

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

                      <Route path={`/${snapshotEditorPath}/:snapshotId`}>
                        <Authenticated>
                          <SnapshotEditorPage />
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

                      <Route path="/map-snapshots">
                        <Authenticated>
                          <MapSnapshotsPage />
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

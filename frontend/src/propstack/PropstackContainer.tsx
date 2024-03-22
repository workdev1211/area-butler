import {
  FunctionComponent,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./PropstackContainer.scss";

import IntegrationNav from "./layout/IntegrationNav";
import { RequestStatusTypesEnum } from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";
import { usePropstackLogin } from "./hooks/propstacklogin";
import ScrollToTop from "../components/ScrollToTop";
import FeedbackModal from "../components/FeedbackModal";
import { SearchContext } from "../context/SearchContext";
import { snapshotEditorPath } from "../shared/shared.constants";
import { LoadingMessage } from "../components/Loading";
import { IIntegrationHandleLogin } from "../../../shared/types/integration";
import BrowserWarningModal from "../components/BrowserWarningModal";

// MOVE TO A SEPARATE COMPONENT START
const calculateViewHeight = (): void => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};
window.addEventListener("resize", calculateViewHeight);
calculateViewHeight();
// MOVE TO A SEPARATE COMPONENT END

export const propstackRootEntries = ["/", "/search"];

const PotentialCustomerPage = lazy(
  () => import("../pages/PotentialCustomerPage")
);
const PotentialCustomersPage = lazy(
  () => import("../pages/PotentialCustomersPage")
);
const RealEstatePage = lazy(() => import("../pages/RealEstatePage"));
const RealEstatesPage = lazy(() => import("../pages/RealEstatesPage"));
const SnapshotEditorPage = lazy(() => import("../pages/SnapshotEditorPage"));
const OpenAiPopup = lazy(() => import("../pages/OpenAiPageContent"));
// const ProductPage = lazy(() => import("./pages/ProductPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapSnapshotsPage = lazy(() => import("../pages/MapSnapshotsPage"));

const PropstackContainer: FunctionComponent = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const { searchContextState } = useContext(SearchContext);

  const history = useHistory();
  const { pathname } = useLocation();
  const { handleLogin } = usePropstackLogin();

  const [loginStatus, setLoginStatus] = useState<IIntegrationHandleLogin>();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  // performs a login
  useEffect(() => {
    const login = async (): Promise<void> => {
      setLoginStatus(await handleLogin());
    };

    void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handles the redirects after a successful login
  useEffect(() => {
    if (
      !integrationUser ||
      !loginStatus ||
      loginStatus.requestStatus === RequestStatusTypesEnum.FAILURE
    ) {
      return;
    }

    if (searchContextState.openAiQueryType) {
      history.push("/open-ai-popup");
      return;
    }

    history.push(
      searchContextState.snapshotId
        ? `/${snapshotEditorPath}/${searchContextState.snapshotId}`
        : "/search"
    );

    // TODO PROPSTACK CONTINGENT - is used only in onOffice for the moment
    // if (integrationUser?.availProdContingents) {
    //   history.push(
    //     searchContextState.snapshotId
    //       ? `/${snapshotEditorPath}/${searchContextState.snapshotId}`
    //       : "/search"
    //   );
    //   return;
    // }
    //
    // history.push("/products");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationUser?.accessToken, loginStatus]);

  if (
    !integrationUser ||
    loginStatus?.requestStatus === RequestStatusTypesEnum.FAILURE
  ) {
    return (
      <div className="flex items-center justify-center h-[100vh] text-lg">
        {loginStatus?.requestStatus === RequestStatusTypesEnum.FAILURE ? (
          loginStatus.message || "Ein Fehler ist aufgetreten!"
        ) : (
          <LoadingMessage />
        )}
      </div>
    );
  }

  return (
    <div className="propstack-app">
      <BrowserWarningModal />
      <Suspense fallback={<LoadingMessage />}>
        <ScrollToTop />
        <IntegrationNav />
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
        {!["products", "map"].includes(currentPath) && <FeedbackModal />}
        <Switch>
          <Route path="/potential-customers/:customerId">
            <PotentialCustomerPage />
          </Route>
          <Route path="/potential-customers">
            <PotentialCustomersPage />
          </Route>
          <Route path="/real-estates/:realEstateId">
            <RealEstatePage />
          </Route>
          <Route path="/real-estates">
            <RealEstatesPage />
          </Route>
          <Route path={`/${snapshotEditorPath}/:snapshotId`}>
            <SnapshotEditorPage />
          </Route>
          <Route path="/map-snapshots">
            <MapSnapshotsPage />
          </Route>
          <Route path="/open-ai-popup">
            <OpenAiPopup />
          </Route>
          {/*<Route path="/products">*/}
          {/*  <ProductPage />*/}
          {/*</Route>*/}
          <Route path={propstackRootEntries}>
            <SearchParamsPage />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default PropstackContainer;

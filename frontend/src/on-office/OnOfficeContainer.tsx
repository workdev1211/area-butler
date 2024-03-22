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
import "./OnOfficeContainer.scss";

import IntegrationNav from "./layout/IntegrationNav";
import { RequestStatusTypesEnum } from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";
import { useOnOfficeLogin } from "./hooks/onofficelogin";
import {
  IOnOfficeHandleLogin,
  OnOfficeLoginActionTypesEnum,
} from "../../../shared/types/on-office";
import ScrollToTop from "../components/ScrollToTop";
import FeedbackModal from "../components/FeedbackModal";
import { SearchContext } from "../context/SearchContext";
import { snapshotEditorPath } from "../shared/shared.constants";
import { LoadingMessage } from "../components/Loading";
import BrowserWarningModal from "../components/BrowserWarningModal";

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

export const onOfficeRootEntries = ["/", "/search"];

const PotentialCustomerPage = lazy(
  () => import("../pages/PotentialCustomerPage")
);
const PotentialCustomersPage = lazy(
  () => import("../pages/PotentialCustomersPage")
);
const RealEstatePage = lazy(() => import("../pages/RealEstatePage"));
const RealEstatesPage = lazy(() => import("../pages/RealEstatesPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const OpenAiPage = lazy(() => import("../pages/OpenAiPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapSnapshotsPage = lazy(() => import("../pages/MapSnapshotsPage"));

const OnOfficeContainer: FunctionComponent = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const { searchContextState } = useContext(SearchContext);

  const history = useHistory();
  const { pathname } = useLocation();
  const { handleOnOfficeLogin } = useOnOfficeLogin();

  const [loginStatus, setLoginStatus] = useState<IOnOfficeHandleLogin>();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  // performs a login
  useEffect(() => {
    const login = async () => {
      setLoginStatus(await handleOnOfficeLogin());
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

    if (
      loginStatus.actionType === OnOfficeLoginActionTypesEnum.CONFIRM_ORDER ||
      integrationUser?.availProdContingents
    ) {
      history.push(
        searchContextState.snapshotId
          ? `/${snapshotEditorPath}/${searchContextState.snapshotId}`
          : "/search"
      );
      return;
    }

    history.push("/products");

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
    <div className="on-office-app">
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
            <MapPage />
          </Route>
          <Route path="/map-snapshots">
            <MapSnapshotsPage />
          </Route>
          <Route path="/open-ai">
            <OpenAiPage />
          </Route>
          <Route path="/products">
            <ProductPage />
          </Route>
          <Route path={onOfficeRootEntries}>
            <SearchParamsPage />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default OnOfficeContainer;

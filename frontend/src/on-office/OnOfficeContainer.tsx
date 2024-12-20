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
import { ResultStatusEnum } from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";
import { useOnOfficeLogin } from "./hooks/onofficelogin";
import { OnOfficeLoginActionTypesEnum } from "../../../shared/types/on-office";
import ScrollToTop from "../components/ScrollToTop";
import { SearchContext } from "../context/SearchContext";
import { snapshotEditorPath } from "../shared/shared.constants";
import { LoadingMessage } from "../components/Loading";
import BrowserWarningModal from "../components/BrowserWarningModal";
import { useIntegrationTools } from "../hooks/integration/integrationtools";
import { IOnOfficeLoginStatus } from "../shared/shared.types";
import SupportLink from "../components/SupportLink";
import IsAdmin from "../auth/IsAdmin";

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
const SnapshotEditorPage = lazy(() => import("../pages/SnapshotEditorPage"));
const OpenAiPage = lazy(() => import("../pages/OpenAiPage"));
const ProductPage = lazy(() => import("../pages/ProductPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapSnapshotsPage = lazy(() => import("../pages/MapSnapshotsPage"));
const CompanyProfilePage = lazy(() => import("../pages/CompanyProfilePage"));

const OnOfficeContainer: FunctionComponent = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const { searchContextState } = useContext(SearchContext);

  const history = useHistory();
  const { pathname } = useLocation();
  const { handleOnOfficeLogin } = useOnOfficeLogin();
  const { checkIsSubActive } = useIntegrationTools();

  const [loginStatus, setLoginStatus] = useState<IOnOfficeLoginStatus>();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  // performs a login
  useEffect(() => {
    const login = async (): Promise<void> => {
      setLoginStatus(
        await handleOnOfficeLogin().catch((e) => {
          console.error(e);

          return {
            requestStatus: ResultStatusEnum.FAILURE,
            message: e.response?.data?.message,
          };
        })
      );
    };

    void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handles the redirects after a successful login
  useEffect(() => {
    if (
      !integrationUser ||
      !loginStatus ||
      loginStatus.requestStatus === ResultStatusEnum.FAILURE
    ) {
      return;
    }

    if (
      loginStatus.actionType === OnOfficeLoginActionTypesEnum.CONFIRM_ORDER ||
      checkIsSubActive() ||
      integrationUser.availProdContingents
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
    loginStatus?.requestStatus === ResultStatusEnum.FAILURE
  ) {
    return (
      <div className="flex items-center justify-center h-[100vh] text-lg">
        {loginStatus?.requestStatus === ResultStatusEnum.FAILURE ? (
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
        {!["products", "map"].includes(currentPath) && <SupportLink />}
        <Switch>
          <Route path="/potential-customers/:customerId">
            <IsAdmin>
              <PotentialCustomerPage />
            </IsAdmin>
          </Route>

          <Route path="/potential-customers">
            <IsAdmin>
              <PotentialCustomersPage />
            </IsAdmin>
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

          <Route path="/open-ai">
            <OpenAiPage />
          </Route>

          {!checkIsSubActive() && (
            <Route path="/products">
              <ProductPage />
            </Route>
          )}

          <Route path="/company-profile">
            <IsAdmin>
              <CompanyProfilePage />
            </IsAdmin>
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

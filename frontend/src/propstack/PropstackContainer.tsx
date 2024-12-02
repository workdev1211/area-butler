import { FC, lazy, Suspense, useContext, useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "react-toastify/dist/ReactToastify.css";
import "./PropstackContainer.scss";

import IntegrationNav from "./layout/IntegrationNav";
import { ResultStatusEnum } from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";
import { usePropstackLogin } from "./hooks/propstacklogin";
import ScrollToTop from "../components/ScrollToTop";
import { SearchContext } from "../context/SearchContext";
import { snapshotEditorPath } from "../shared/shared.constants";
import { LoadingMessage } from "../components/Loading";
import BrowserWarningModal from "../components/BrowserWarningModal";
import { useIntegrationTools } from "../hooks/integration/integrationtools";
import { ILoginStatus } from "../shared/shared.types";
import SupportLink from "../components/SupportLink";

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
const ProductPage = lazy(() => import("../pages/ProductPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapSnapshotsPage = lazy(() => import("../pages/MapSnapshotsPage"));
const CompanyProfilePage = lazy(() => import("../pages/CompanyProfilePage"));

const PropstackContainer: FC = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const { searchContextState } = useContext(SearchContext);

  const history = useHistory();
  const { pathname } = useLocation();
  const { handlePropstackLogin } = usePropstackLogin();
  const { checkIsSubActive } = useIntegrationTools();
  const { t } = useTranslation();

  const [loginStatus, setLoginStatus] = useState<ILoginStatus>();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  // performs a login
  useEffect(() => {
    const login = async (): Promise<void> => {
      setLoginStatus(
        await handlePropstackLogin().catch((e) => {
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

    if (searchContextState.openAiQueryType) {
      if (!searchContextState.snapshotId) {
        alert(t(IntlKeys.errors.createSnapshot));
        return;
      }

      history.push("/open-ai-popup");
      return;
    }

    if (checkIsSubActive() || integrationUser.availProdContingents) {
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
        {!["products", "map"].includes(currentPath) && <SupportLink />}
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
            <OpenAiPopup embedded={false} />
          </Route>

          {!checkIsSubActive() && (
            <Route path="/products">
              <ProductPage />
            </Route>
          )}

          {integrationUser.isAdmin && (
            <Route path="/company-profile">
              <CompanyProfilePage />
            </Route>
          )}

          <Route path={propstackRootEntries}>
            <SearchParamsPage />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default PropstackContainer;

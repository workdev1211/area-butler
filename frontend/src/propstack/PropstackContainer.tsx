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
// const OpenAiPage = lazy(() => import("./pages/OpenAiPage"));
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

  const [isErrorOccurred, setIsErrorOccurred] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  useEffect(() => {
    const login = async (): Promise<void> => {
      const { requestStatus, message } = await handleLogin();

      if (requestStatus === RequestStatusTypesEnum.FAILURE) {
        setErrorMessage(message);
        setIsErrorOccurred(true);
        return;
      }
    };

    void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!integrationUser || isErrorOccurred) {
      return;
    }

    history.push(
      searchContextState.snapshotId
        ? `/${snapshotEditorPath}/${searchContextState.snapshotId}`
        : "/search"
    );

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
  }, [integrationUser?.accessToken, isErrorOccurred]);

  if (!integrationUser || isErrorOccurred) {
    return (
      <div className="flex items-center justify-center h-[100vh] text-lg">
        {isErrorOccurred ? (
          errorMessage || "Ein Fehler ist aufgetreten!"
        ) : (
          <LoadingMessage />
        )}
      </div>
    );
  }

  return (
    <div className="propstack-app">
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
          {/*<Route path="/open-ai">*/}
          {/*  <OpenAiPage />*/}
          {/*</Route>*/}
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

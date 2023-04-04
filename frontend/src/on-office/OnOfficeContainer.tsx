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
import { useLogin } from "./hooks/login";
import { OnOfficeLoginActionTypesEnum } from "../../../shared/types/on-office";
import ScrollToTop from "../components/ScrollToTop";
import FeedbackModal from "../components/FeedbackModal";
import { SearchContext } from "../context/SearchContext";

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

export const LoadingMessage = () => <div>Seite wird geladen...</div>;
export const onOfficeRootEntries = ["/", "/search"];

const ProductPage = lazy(() => import("./pages/ProductPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const OpenAiPage = lazy(() => import("./pages/OpenAiPage"));

const OnOfficeContainer: FunctionComponent = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: { integrationSnapshotId },
  } = useContext(SearchContext);

  const history = useHistory();
  const { pathname } = useLocation();
  const { handleLogin } = useLogin();

  const [isErrorOccurred, setIsErrorOccurred] = useState(false);
  const [actionType, setActionType] = useState<OnOfficeLoginActionTypesEnum>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const currentPath = pathname.replace(/^\/([^/]+).*$/, "$1");

  useEffect(() => {
    const login = async () => {
      const {
        requestStatus,
        actionType: loginActionType,
        message,
      } = await handleLogin();

      if (requestStatus === RequestStatusTypesEnum.FAILURE) {
        setErrorMessage(message);
        setIsErrorOccurred(true);
        return;
      }

      setActionType(loginActionType);
    };

    void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!integrationUser || isErrorOccurred || !actionType) {
      return;
    }

    if (
      actionType === OnOfficeLoginActionTypesEnum.CONFIRM_ORDER ||
      integrationUser?.availProdContingents
    ) {
      history.push(
        integrationSnapshotId ? `/map/${integrationSnapshotId}` : "/search"
      );
      return;
    }

    history.push("/products");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationUser?.accessToken, isErrorOccurred, actionType]);

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
    <div className="on-office-app">
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
          <Route path="/map/:snapshotId">
            <MapPage />
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

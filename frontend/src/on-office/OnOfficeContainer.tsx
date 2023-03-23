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

import IntegrationNav from "./layout/IntegrationNav";
import { RequestStatusTypesEnum } from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";
import { useLogin } from "./hooks/login";
import { OnOfficeLoginActionTypesEnum } from "../../../shared/types/on-office";

export const LoadingMessage = () => <div>Seite wird geladen...</div>;
export const onOfficeRootEntries = ["/", "/search"];

const ScrollToTop: FunctionComponent = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ProductPage = lazy(() => import("./pages/ProductPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const OpenAiPage = lazy(() => import("./pages/OpenAiPage"));

const OnOfficeContainer: FunctionComponent = () => {
  const { userState } = useContext(UserContext);

  const history = useHistory();
  const { handleLogin } = useLogin();

  const [isErrorOccurred, setIsErrorOccurred] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    const login = async () => {
      const { requestStatus, actionType, message } = await handleLogin();

      if (requestStatus === RequestStatusTypesEnum.FAILURE) {
        setErrorMessage(message);
        setIsErrorOccurred(true);
        return;
      }

      if (actionType === OnOfficeLoginActionTypesEnum.PERFORM_LOGIN) {
        history.push("/products");
        return;
      }

      history.push("/search");
    };

    void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!userState.integrationUser || isErrorOccurred) {
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

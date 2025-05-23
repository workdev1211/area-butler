import { FC, lazy, Suspense, useContext, useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

import "react-toastify/dist/ReactToastify.css";
import "./MyVivendaContainer.scss";

import { ResultStatusEnum } from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";
import ScrollToTop from "../components/ScrollToTop";
import { SearchContext } from "../context/SearchContext";
import { snapshotEditorPath } from "../shared/shared.constants";
import { Loading, LoadingMessage } from "../components/Loading";
import { ILoginStatus } from "../shared/shared.types";
import BrowserWarningModal from "../components/BrowserWarningModal";
import { useMyVivendaLogin } from "./hooks/myvivendalogin";
import { IntlKeys } from "../i18n/keys";
import SupportLink from "../components/SupportLink";

// MOVE TO A SEPARATE COMPONENT START
const calculateViewHeight = (): void => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};
window.addEventListener("resize", calculateViewHeight);
calculateViewHeight();
// MOVE TO A SEPARATE COMPONENT END

const SnapshotEditorPage = lazy(() => import("../pages/SnapshotEditorPage"));

const MyVivendaContainer: FC = () => {
  const {
    userState: { user },
  } = useContext(UserContext);
  const {
    searchContextState: { snapshotId },
  } = useContext(SearchContext);

  const history = useHistory();
  const { handleMyVivendaLogin } = useMyVivendaLogin();
  const { t } = useTranslation();
  const [loginStatus, setLoginStatus] = useState<ILoginStatus>();

  // performs a login
  useEffect(() => {
    const login = async (): Promise<void> => {
      setLoginStatus(
        await handleMyVivendaLogin().catch((e) => {
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
      !user ||
      !snapshotId ||
      !loginStatus ||
      loginStatus.requestStatus === ResultStatusEnum.FAILURE
    ) {
      return;
    }

    history.push(`/${snapshotEditorPath}/${snapshotId}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginStatus, snapshotId, user]);

  if (!user || loginStatus?.requestStatus === ResultStatusEnum.FAILURE) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        {loginStatus?.requestStatus === ResultStatusEnum.FAILURE ? (
          loginStatus.message || t(IntlKeys.common.errorOccurred)
        ) : (
          <Loading />
        )}
      </div>
    );
  }

  return (
    <div className="my-vivenda-app">
      <BrowserWarningModal />
      <Suspense fallback={<LoadingMessage />}>
        <ScrollToTop />
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
        <SupportLink />
        <Switch>
          <Route path={`/${snapshotEditorPath}/:snapshotId`}>
            <SnapshotEditorPage />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default MyVivendaContainer;

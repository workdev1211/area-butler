import {
  FunctionComponent,
  lazy,
  Suspense,
  useContext,
  useEffect,
} from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import IntegrationNav from "./layout/IntegrationNav";
import { getQueryParamsAndUrl } from "../shared/shared.functions";
import {
  ApiCoordinates,
  ApiSearchResultSnapshotResponse,
} from "../../../shared/types/types";
import { UserActionTypes, UserContext } from "../context/UserContext";
import { IntegrationTypesEnum } from "../../../shared/types/integration";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../../shared/types/integration-user";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { useHttp } from "../hooks/http";
import { IApiOnOfficeFetchLatestSnapshotReq } from "../../../shared/types/on-office";

export const LoadingMessage = () => <div>Seite wird geladen...</div>;
export const onOfficeRouteEntries = ["/", "/search"];

const ProductPage = lazy(() => import("./pages/ProductPage"));
const ConfirmOrderPage = lazy(() => import("./pages/ConfirmOrderPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const OpenAiPage = lazy(() => import("./pages/OpenAiPage"));

const OnOfficeContainer: FunctionComponent = () => {
  console.log("OnOfficeApp", 1);
  const history = useHistory();
  const { userState, userDispatch } = useContext(UserContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { post } = useHttp();

  useEffect(() => {
    const queryParamsAndUrl = getQueryParamsAndUrl();
    console.log("OnOfficeApp", 2, queryParamsAndUrl);

    const estateId = "33";
    const integrationUserId = "21";
    const accessToken = "asdas";
    const hasProductContingent = true;
    const address = "Herzbergstraße 2A, 14469 Potsdam, Deutschland";
    const coordinates: ApiCoordinates = {
      lat: 52.4164949,
      lng: 12.9964363,
    };

    if (!hasProductContingent) {
      history.push("/products");
    }

    userDispatch({
      type: UserActionTypes.SET_INTEGRATION_USER,
      payload: {
        integrationUserId,
        accessToken,
        integrationType: IntegrationTypesEnum.ON_OFFICE,
        availProdContingents: {
          [ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI]: 5,
        },
      },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: address },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: { ...coordinates },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_INTEGRATION_ID,
      payload: estateId,
    });
  }, [history, searchContextDispatch, userDispatch]);

  useEffect(() => {
    const fetchLatestSnapshot = async () => {
      const snapshotResponse = (
        await post<
          ApiSearchResultSnapshotResponse,
          IApiOnOfficeFetchLatestSnapshotReq
        >(
          "/api/on-office/fetch-latest-snapshot",
          { integrationId: searchContextState.integrationId! },
          {
            Authorization: `AccessToken ${userState.integrationUser?.accessToken}`,
          }
        )
      ).data;

      if (snapshotResponse) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_INTEGRATION_SNAPSHOT_ID,
          payload: snapshotResponse.id,
        });
      }
    };

    if (
      searchContextState.integrationId &&
      userState.integrationUser?.accessToken
    ) {
      void fetchLatestSnapshot();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextDispatch,
    searchContextState.integrationId,
    userState.integrationUser?.accessToken,
  ]);

  if (!userState.integrationUser) {
    return <LoadingMessage />;
  }

  return (
    <div className="on-office-app">
      <Suspense fallback={<LoadingMessage />}>
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
          <Route path="/confirm-order">
            <ConfirmOrderPage />
          </Route>
          <Route path="/products">
            <ProductPage />
          </Route>
          <Route path={onOfficeRouteEntries}>
            <SearchParamsPage />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default OnOfficeContainer;

import {
  FunctionComponent,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import IntegrationNav from "./layout/IntegrationNav";
import { getQueryParamsAndUrl, toastError } from "../shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import { UserActionTypes, UserContext } from "../context/UserContext";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../../shared/types/integration-user";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { useHttp } from "../hooks/http";
import {
  IApiOnOfficeFetchLatestSnapshotReq,
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeLoginReq,
  IApiOnOfficeLoginRes,
} from "../../../shared/types/on-office";

export const LoadingMessage = () => <div>Seite wird geladen...</div>;
export const onOfficeRootEntries = ["/", "/search"];

const ProductPage = lazy(() => import("./pages/ProductPage"));
const ConfirmOrderPage = lazy(() => import("./pages/ConfirmOrderPage"));
const SearchParamsPage = lazy(() => import("../pages/SearchParamsPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const OpenAiPage = lazy(() => import("./pages/OpenAiPage"));

const OnOfficeContainer: FunctionComponent = () => {
  console.log("OnOfficeApp", 1);

  const { userState, userDispatch } = useContext(UserContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const history = useHistory();
  const { post } = useHttp();

  const [isSignatureIncorrect, setIsSignatureIncorrect] = useState(false);

  useEffect(() => {
    console.log("OnOfficeApp", 2);

    const login = async () => {
      const queryParamsAndUrl =
        getQueryParamsAndUrl<IApiOnOfficeLoginQueryParams>();

      if (!queryParamsAndUrl) {
        return;
      }

      const loginData: IApiOnOfficeLoginReq = {
        url: queryParamsAndUrl.url,
        onOfficeQueryParams: queryParamsAndUrl.queryParams,
      };

      console.log("OnOfficeApp", 3, loginData);

      try {
        const {
          integrationId,
          realEstate,
          accessToken,
          availProdContingents,
          config,
        } = (
          await post<IApiOnOfficeLoginRes>("/api/on-office/login", loginData)
        ).data;

        console.log(
          "OnOfficeApp",
          9,
          integrationId,
          realEstate,
          accessToken,
          availProdContingents,
          config
        );

        userDispatch({
          type: UserActionTypes.SET_INTEGRATION_USER,
          payload: {
            accessToken,
            availProdContingents,
            config,
          },
        });

        userDispatch({
          type: UserActionTypes.SET_INTEGRATION_USER,
          payload: {
            accessToken,
            config,
            availProdContingents: {
              [ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI]: 5,
            },
          },
        });

        searchContextDispatch({
          type: SearchContextActionTypes.SET_PLACES_LOCATION,
          payload: { label: realEstate.address },
        });

        searchContextDispatch({
          type: SearchContextActionTypes.SET_LOCATION,
          payload: { ...realEstate.coordinates },
        });

        searchContextDispatch({
          type: SearchContextActionTypes.SET_INTEGRATION_ID,
          payload: integrationId,
        });

        searchContextDispatch({
          type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
          payload: realEstate,
        });

        if (!config?.hideProductPage) {
          history.push("/products");
          return;
        }

        history.push("/search");
      } catch (e: any) {
        setIsSignatureIncorrect(true);
        toastError("Ein Fehler ist aufgetreten!");
        console.error("Verification error: ", e);
      }
    };

    void login();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, searchContextDispatch, userDispatch]);

  useEffect(() => {
    if (
      !searchContextState.integrationId ||
      !userState.integrationUser?.accessToken
    ) {
      return;
    }

    // TODO move to location-integration controller
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

      if (!snapshotResponse) {
        return;
      }

      // TODO add other important snapshot context data
      searchContextDispatch({
        type: SearchContextActionTypes.SET_INTEGRATION_SNAPSHOT_ID,
        payload: snapshotResponse.id,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: snapshotResponse.snapshot.transportationParams,
      });
    };

    void fetchLatestSnapshot();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextDispatch,
    searchContextState.integrationId,
    userState.integrationUser?.accessToken,
  ]);

  if (!userState.integrationUser || isSignatureIncorrect) {
    return (
      <div className="flex items-center justify-center h-[100vh] text-lg">
        {isSignatureIncorrect ? "Signatur nicht korrekt!" : <LoadingMessage />}
      </div>
    );
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
          <Route path={onOfficeRootEntries}>
            <SearchParamsPage />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default OnOfficeContainer;

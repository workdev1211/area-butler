import { FunctionComponent, useContext, useEffect, useState } from "react";
import axios from "axios";

import "./EmbedContainer.scss";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
} from "../../../shared/types/types";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import SearchResultContainer from "../components/SearchResultContainer";
import { deriveInitialEntityGroups } from "../shared/shared.functions";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import { addressExpiredMessage } from "../../../shared/messages/error.message";
import { defaultMapZoom } from "../map/Map";
import { ApiRealEstateStatusEnum } from "../../../shared/types/real-estate";

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

const EmbedContainer: FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);

  const [result, setResult] = useState<ApiSearchResultSnapshotResponse>();
  const [isAddressExpired, setIsAddressExpired] = useState(false);
  const [mapBoxToken, setMapBoxToken] = useState("");
  const [mapZoomLevel, setMapZoomLevel] = useState(defaultMapZoom);
  const [searchConfig, setSearchConfig] =
    useState<ApiSearchResultSnapshotConfig>();

  const getQueryVariable = (variable: string) => {
    const query = window.location.search.substring(1);
    const vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");

      if (pair[0] === variable) {
        return pair[1];
      }
    }

    return undefined;
  };

  // fetch saved response
  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = process.env.REACT_APP_BASE_URL || "";

      try {
        const response = (
          await axios.get<ApiSearchResultSnapshotResponse>(
            `${baseUrl}/api/location/snapshot/${getQueryVariable("token")}`
          )
        ).data;

        const config = response.config;

        if (config && !("showAddress" in config)) {
          config["showAddress"] = true;
        }

        if (config && !("showStreetViewLink" in config)) {
          config["showStreetViewLink"] = true;
        }

        if (config?.zoomLevel) {
          setMapZoomLevel(config.zoomLevel);
        }

        setMapBoxToken(response.mapboxToken);
        setResult(response);
        setSearchConfig(config);
      } catch (e: any) {
        const { statusCode, message } = e.response.data;
        setIsAddressExpired(
          statusCode === 402 && message === addressExpiredMessage
        );
      }
    };

    void fetchData();
  }, [setMapBoxToken, searchContextDispatch]);

  useEffect(() => {
    if (result && searchConfig) {
      const {
        searchResponse,
        transportationParams,
        localityParams,
        location,
        placesLocation,
        preferredLocations = [],
        routes = [],
        transitRoutes = [],
        realEstateListings = [],
      } = result.snapshot;

      const filteredRealEstateListings = searchConfig.realEstateStatus
        ? realEstateListings.filter(
            ({ status }) =>
              searchConfig.realEstateStatus === ApiRealEstateStatusEnum.ALLE ||
              status === searchConfig.realEstateStatus
          )
        : realEstateListings;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_RESPONSE,
        payload: searchResponse,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: transportationParams,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
        payload: localityParams,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PLACES_LOCATION,
        payload: placesLocation,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION,
        payload: location,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
        payload: preferredLocations,
      });

      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: realEstateListings,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
        payload: routes,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES,
        payload: transitRoutes,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...searchConfig },
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_TOKEN,
        payload: result.token,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups(
          searchResponse,
          searchConfig,
          filteredRealEstateListings,
          preferredLocations
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, searchConfig, searchContextDispatch]);

  if (!searchContextState.searchResponse) {
    return isAddressExpired ? (
      <div>{`Ihre Adresse ist abgelaufen. Bitte besuchen Sie die ${process.env.REACT_APP_BASE_URL} und verlängern Sie sie.`}</div>
    ) : (
      <div>Loading...</div>
    );
  }

  return (
    <SearchResultContainer
      mapBoxToken={mapBoxToken}
      mapBoxMapId={searchConfig?.mapBoxMapId}
      searchResponse={searchContextState.searchResponse}
      placesLocation={searchContextState.placesLocation}
      location={searchContextState.mapCenter ?? searchContextState.location!}
      mapZoomLevel={mapZoomLevel}
      embedMode={true}
    />
  );
};

export default EmbedContainer;

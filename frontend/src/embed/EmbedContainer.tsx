import React, { useContext, useEffect, useState } from "react";
import "./EmbedContainer.scss";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse
} from "../../../shared/types/types";
import axios from "axios";
import {
  SearchContext,
  SearchContextActionTypes
} from "../context/SearchContext";
import SearchResultContainer from "../components/SearchResultContainer";
import { deriveInitialEntityGroups } from "../shared/shared.functions";
import {
  RealEstateActionTypes,
  RealEstateContext
} from "../context/RealEstateContext";

const EmbedContainer: React.FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );
  const { realEstateDispatch } = useContext(RealEstateContext);

  const [result, setResult] = useState<ApiSearchResultSnapshotResponse>();

  const [mapBoxToken, setMapBoxToken] = useState("");
  const [searchConfig, setSearchConfig] = useState<
    ApiSearchResultSnapshotConfig
  >();

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
      const response = (
        await axios.get<ApiSearchResultSnapshotResponse>(
          `${baseUrl}/api/location/snapshot/${getQueryVariable("token")}`
        )
      ).data;
      setMapBoxToken(response.mapboxToken);
      setResult(response);
      setSearchConfig(response.config);
    };
    void fetchData();
  }, [setMapBoxToken, searchContextDispatch]);

  useEffect(() => {
    if (!!result && !!searchConfig) {
      const {
        searchResponse,
        transportationParams,
        localityParams,
        location,
        placesLocation,
        preferredLocations = [],
        routes = [],
        transitRoutes = [],
        realEstateListings = []
      } = result.snapshot;
      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_RESPONSE,
        payload: searchResponse
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: transportationParams
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
        payload: localityParams
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_PLACES_LOCATION,
        payload: placesLocation
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION,
        payload: location
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
        payload: preferredLocations
      });
      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: realEstateListings
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
        payload: routes
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES,
        payload: transitRoutes
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...searchConfig }
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups(
          searchResponse,
          searchConfig,
          realEstateListings,
          preferredLocations
        )
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, searchConfig, searchContextDispatch]);

  if (!searchContextState.searchResponse) {
    return <div>Loading...</div>;
  }

  return (
    <SearchResultContainer
      mapBoxToken={mapBoxToken}
      mapBoxMapId={searchConfig?.mapBoxMapId}
      searchResponse={searchContextState.searchResponse}
      placesLocation={searchContextState.placesLocation}
      location={searchContextState.mapCenter ?? searchContextState.location!}
      mapZoomLevel={searchContextState.mapZoomLevel!}
      embedMode={true}
    />
  );
};

export default EmbedContainer;

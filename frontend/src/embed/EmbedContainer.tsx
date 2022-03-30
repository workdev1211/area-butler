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
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

const EmbedContainer: React.FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );

  const [result, setResult] = useState<ApiSearchResultSnapshotResponse>();
  const [routes, setRoutes] = useState<EntityRoute[]>([]);
  const [transitRoutes, setTransitRoutes] = useState<EntityTransitRoute[]>([]);
  const [realEstateListings, setRealEstateListings] = useState<
    ApiRealEstateListing[]
  >([]);

  const [mapBoxToken, setMapBoxToken] = useState("");
  const [searchConfig, setSearchConfig] = useState<
    ApiSearchResultSnapshotConfig
  >();

  const getQueryVariable = (variable: string) => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
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
    fetchData();
  }, [setMapBoxToken, searchContextDispatch]);

  useEffect(() => {
    if (!!result) {
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
      setRoutes(routes);
      setTransitRoutes(transitRoutes);
      setRealEstateListings(realEstateListings);
    }
  }, [result, searchContextDispatch]);

  if (!searchContextState.searchResponse) {
    return <div>Loading...</div>;
  }

  return (
    <SearchResultContainer
      mapBoxToken={mapBoxToken}
      mapBoxMapId={searchConfig?.mapBoxMapId}
      searchResponse={searchContextState.searchResponse}
      transportationParams={searchContextState.transportationParams}
      placesLocation={searchContextState.placesLocation}
      location={searchContextState.mapCenter ?? searchContextState.location!}
      highlightId={searchContextState.highlightId!}
      mapZoomLevel={searchContextState.mapZoomLevel!}
      preferredLocations={searchContextState.preferredLocations}
      searchContextDispatch={searchContextDispatch}
      embedMode={true}
      config={searchConfig}
      initialRoutes={routes}
      initialTransitRoutes={transitRoutes}
      listings={realEstateListings}
    />
  );
};

export default EmbedContainer;

import React, { useContext, useEffect, useState } from "react";
import "./EmbedContainer.css";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import axios from "axios";
import {
  SearchContext,
  SearchContextActionTypes
} from "../context/SearchContext";
import SearchResultContainer from "../components/SearchResultContainer";

const EmbedContainer: React.FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );

  const [result, setResult] = useState<ApiSearchResultSnapshotResponse>();

  const [mapBoxToken, setMapBoxToken] = useState("");
  const [mapBoxMapId, setMapBoxMapId] = useState<string | undefined>(undefined);

  // fetch saved response
  useEffect(() => {
    const fetchData = async () => {
      const getQueryVariable = (variable: string) => {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] === variable) {
            return pair[1];
          }
        }
        return false;
      };
      const baseUrl = process.env.REACT_APP_BASE_URL || "";
      const response = (
        await axios.get<ApiSearchResultSnapshotResponse>(
          `${baseUrl}/api/location/snapshot/${getQueryVariable("token")}`
        )
      ).data;
      setMapBoxToken(response.mapboxToken);
      setMapBoxMapId(response.config?.mapBoxMapId);
      setResult(response);
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
        placesLocation
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
    }
  }, [result, searchContextDispatch]);

  if (!searchContextState.searchResponse) {
    return <div>Loading...</div>;
  }

  return (
    <SearchResultContainer
      mapBoxToken={mapBoxToken}
      mapBoxMapId={mapBoxMapId}
      searchResponse={searchContextState.searchResponse}
      transportationParams={searchContextState.transportationParams}
      placesLocation={searchContextState.placesLocation}
      location={searchContextState.mapCenter ?? searchContextState.location!}
      highlightId={searchContextState.highlightId!}
      mapZoomLevel={searchContextState.mapZoomLevel!}
      searchContextDispatch={searchContextDispatch}
      embedMode={true}
    />
  );
};

export default EmbedContainer;

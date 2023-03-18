import { FunctionComponent, useContext, useEffect, useState } from "react";

import "../../embed/EmbedContainer.scss";

import { useHttp } from "../../hooks/http";
import { ApiRealEstateStatusEnum } from "../../../../shared/types/real-estate";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { getCombinedOsmEntityTypes } from "../../../../shared/functions/shared.functions";
import { defaultMapZoom } from "../../shared/shared.constants";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../../context/RealEstateContext";
import { deriveInitialEntityGroups } from "../../shared/shared.functions";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
} from "../../../../shared/types/types";
import SearchResultContainer from "../../components/SearchResultContainer";
import { LoadingMessage } from "../../OnOffice";

const MapPage: FunctionComponent = () => {
  const { post } = useHttp();

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);

  const [result, setResult] = useState<ApiSearchResultSnapshotResponse>();
  const [searchConfig, setSearchConfig] =
    useState<ApiSearchResultSnapshotConfig>();
  const [mapBoxToken, setMapBoxToken] = useState("");

  useEffect(() => {
    console.log(1, "OnOfficeContainer");

    const findOrCreateSnapshot = async () => {
      // TODO TEST DATA
      const response = (
        await post<ApiSearchResultSnapshotResponse>(
          "/api/on-office/find-create-snapshot",
          {
            integrationId: "111",
            integrationUserId: "21",
          }
        )
      ).data;

      console.log(9, "OnOfficeContainer", response);
      const config = response.config;

      if (config && !("showAddress" in config)) {
        config["showAddress"] = true;
      }

      if (config && !("showStreetViewLink" in config)) {
        config["showStreetViewLink"] = true;
      }

      setResult(response);
      setSearchConfig(config);
      setMapBoxToken(response.mapboxAccessToken);
    };

    void findOrCreateSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!result || !searchConfig) {
      return;
    }

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
      payload: getCombinedOsmEntityTypes(localityParams),
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
      type: SearchContextActionTypes.SET_MAP_ZOOM_LEVEL,
      payload: searchConfig.zoomLevel || defaultMapZoom,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, searchConfig, searchContextDispatch]);

  if (!searchContextState.searchResponse) {
    return <LoadingMessage />;
  }

  return (
    <SearchResultContainer
      mapBoxToken={mapBoxToken}
      mapBoxMapId={searchConfig?.mapBoxMapId}
      searchResponse={searchContextState.searchResponse}
      placesLocation={searchContextState.placesLocation}
      location={searchContextState.mapCenter ?? searchContextState.location!}
      isTrial={false}
      embedMode={true}
    />
  );
};

export default MapPage;

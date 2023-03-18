import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";

import "../../embed/EmbedContainer.scss";

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
import SearchResultContainer, {
  ICurrentMapRef,
} from "../../components/SearchResultContainer";
import { LoadingMessage } from "../../OnOffice";
import { useAnalysis } from "../../hooks/analysis";
import { SnippetEditorRouterProps } from "../../pages/SnippetEditorPage";

const MapPage: FunctionComponent = () => {
  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { fetchSnapshot } = useAnalysis();
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);

  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshotResponse>();
  const [snapshotConfig, setSnapshotConfig] =
    useState<ApiSearchResultSnapshotConfig>();
  const [mapBoxToken, setMapBoxToken] = useState("");

  useEffect(() => {
    console.log(1, snapshotId);
    if (!snapshotId) {
      return;
    }

    const getSnapshot = async () => {
      const snapshotResponse = await fetchSnapshot(snapshotId);
      const config = snapshotResponse.config!;

      if (config && !("showAddress" in config)) {
        config["showAddress"] = true;
      }

      if (config && !("showStreetViewLink" in config)) {
        config["showStreetViewLink"] = true;
      }

      setSnapshot(snapshotResponse);
      setSnapshotConfig(config);
      setMapBoxToken(snapshotResponse.mapboxAccessToken);
    };

    void getSnapshot();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  useEffect(() => {
    if (!snapshot || !snapshotConfig) {
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
    } = snapshot.snapshot;

    const filteredRealEstateListings = snapshotConfig.realEstateStatus
      ? realEstateListings.filter(
          ({ status }) =>
            snapshotConfig.realEstateStatus === ApiRealEstateStatusEnum.ALLE ||
            status === snapshotConfig.realEstateStatus
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
      payload: snapshotConfig.zoomLevel || defaultMapZoom,
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
      payload: { ...snapshotConfig },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_TOKEN,
      payload: snapshot.token,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups(
        searchResponse,
        snapshotConfig,
        filteredRealEstateListings,
        preferredLocations
      ),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, snapshotConfig]);

  useEffect(() => {
    if (
      mapRef.current &&
      !mapRef.current.handleScrollWheelZoom.isScrollWheelZoomEnabled()
    ) {
      mapRef.current.handleScrollWheelZoom.enableScrollWheelZoom();
    }
  }, [mapRef.current]);

  if (!searchContextState.searchResponse && !mapBoxToken) {
    return <LoadingMessage />;
  }

  return (
    <SearchResultContainer
      mapBoxToken={mapBoxToken}
      mapBoxMapId={snapshotConfig?.mapBoxMapId}
      searchResponse={searchContextState.searchResponse!}
      placesLocation={searchContextState.placesLocation}
      location={searchContextState.mapCenter ?? searchContextState.location!}
      isTrial={false}
      embedMode={true}
      ref={mapRef}
    />
  );
};

export default MapPage;

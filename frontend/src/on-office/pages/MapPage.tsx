import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";

import "./MapPage.scss";

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
  ApiTourNamesEnum,
  MapDisplayModesEnum,
} from "../../../../shared/types/types";
import SearchResultContainer, {
  ICurrentMapRef,
} from "../../components/SearchResultContainer";
import { LoadingMessage } from "../OnOfficeContainer";
import { useLocationData } from "../../hooks/locationdata";
import { SnippetEditorRouterProps } from "../../pages/SnippetEditorPage";
import TourStarter from "../../tour/TourStarter";

const MapPage: FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);

  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { fetchSnapshot, saveSnapshotConfig } = useLocationData(true);
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const [snapshotResponse, setSnapshotResponse] =
    useState<ApiSearchResultSnapshotResponse>();
  const [snapshotConfig, setSnapshotConfig] =
    useState<ApiSearchResultSnapshotConfig>();
  const [mapBoxToken, setMapBoxToken] = useState("");

  useEffect(() => {
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

      setSnapshotResponse(snapshotResponse);
      setSnapshotConfig(config);
      setMapBoxToken(snapshotResponse.mapboxAccessToken);
    };

    void getSnapshot();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  useEffect(() => {
    if (!snapshotResponse || !snapshotConfig) {
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
    } = snapshotResponse.snapshot;

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
      payload: snapshotResponse.token,
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
  }, [snapshotResponse, snapshotConfig]);

  useEffect(() => {
    if (
      mapRef.current &&
      !mapRef.current.handleScrollWheelZoom.isScrollWheelZoomEnabled()
    ) {
      mapRef.current.handleScrollWheelZoom.enableScrollWheelZoom();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef.current]);

  if (!searchContextState.searchResponse || !mapBoxToken) {
    return <LoadingMessage />;
  }

  return (
    <>
      <TourStarter tour={ApiTourNamesEnum.INT_MAP_MENU} />
      <SearchResultContainer
        mapBoxToken={mapBoxToken}
        mapBoxMapId={snapshotConfig?.mapBoxMapId}
        searchResponse={searchContextState.searchResponse!}
        placesLocation={searchContextState.placesLocation}
        location={searchContextState.mapCenter ?? searchContextState.location!}
        isTrial={false}
        mapDisplayMode={MapDisplayModesEnum.INTEGRATION}
        saveConfig={async () => {
          await saveSnapshotConfig(
            mapRef,
            snapshotId,
            snapshotResponse?.snapshot!
          );
        }}
        ref={mapRef}
      />
    </>
  );
};

export default MapPage;

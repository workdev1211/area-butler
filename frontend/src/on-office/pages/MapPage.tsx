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
import { deriveInitialEntityGroups } from "../../shared/shared.functions";
import {
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

  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { fetchSnapshot, saveSnapshotConfig } = useLocationData(true);
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const [snapshotResponse, setSnapshotResponse] =
    useState<ApiSearchResultSnapshotResponse>();
  const [mapBoxToken, setMapBoxToken] = useState("");

  useEffect(() => {
    if (!snapshotId) {
      return;
    }

    const getSnapshot = async () => {
      const snapshotResponseData = await fetchSnapshot(snapshotId);
      const config = snapshotResponseData.config!;

      if (config && !("showAddress" in config)) {
        config["showAddress"] = true;
      }

      if (config && !("showStreetViewLink" in config)) {
        config["showStreetViewLink"] = true;
      }

      setSnapshotResponse(snapshotResponseData);
      setMapBoxToken(snapshotResponseData.mapboxAccessToken);
    };

    void getSnapshot();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  useEffect(() => {
    if (!snapshotResponse || !snapshotResponse.config) {
      return;
    }

    const {
      snapshot: {
        searchResponse,
        transportationParams,
        localityParams,
        location,
        placesLocation,
        preferredLocations = [],
        routes = [],
        transitRoutes = [],
        realEstateListings = [],
      },
      config,
    } = snapshotResponse;

    const filteredRealEstateListings = config.realEstateStatus
      ? realEstateListings.filter(
          ({ status }) =>
            config.realEstateStatus === ApiRealEstateStatusEnum.ALLE ||
            status === config.realEstateStatus
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
      payload: config.zoomLevel || defaultMapZoom,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: preferredLocations,
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
      payload: { ...config },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_TOKEN,
      payload: snapshotResponse.token,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups(
        searchResponse,
        config,
        filteredRealEstateListings,
        preferredLocations
      ),
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_INTEGRATION_IFRAME_ENDS_AT,
      payload: snapshotResponse.iframeEndsAt,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotResponse]);

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
      <TourStarter tour={ApiTourNamesEnum.INT_MAP} />
      <SearchResultContainer
        mapBoxToken={mapBoxToken}
        mapBoxMapId={snapshotResponse?.config?.mapBoxMapId}
        searchResponse={searchContextState.searchResponse!}
        searchAddress={searchContextState.placesLocation?.label}
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

import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useParams } from "react-router-dom";

import "./MapPage.scss";

import { ApiRealEstateStatusEnum } from "../../../../shared/types/real-estate";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { getCombinedOsmEntityTypes } from "../../../../shared/functions/shared.functions";
import { defaultMapZoom } from "../../shared/shared.constants";
import {
  createCodeSnippet,
  createDirectLink,
  deriveAvailableMeansFromResponse,
  deriveInitialEntityGroups,
} from "../../shared/shared.functions";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  ApiTourNamesEnum,
  MapDisplayModesEnum,
} from "../../../../shared/types/types";
import SearchResultContainer, {
  ICurrentMapRef,
  IEditorTabProps,
  IExportTabProps,
} from "../../components/SearchResultContainer";
import { LoadingMessage } from "../OnOfficeContainer";
import { useLocationData } from "../../hooks/locationdata";
import { SnippetEditorRouterProps } from "../../pages/SnippetEditorPage";
import TourStarter from "../../tour/TourStarter";
import { IMapPageHistoryState } from "../../shared/shared.types";
import { useCensusData } from "../../hooks/censusdata";
import { useFederalElectionData } from "../../hooks/federalelectiondata";
import { useParticlePollutionData } from "../../hooks/particlepollutiondata";
import { useLocationIndexData } from "../../hooks/locationindexdata";

const MapPage: FunctionComponent = () => {
  const { state } = useLocation<IMapPageHistoryState>();

  const { fetchCensusData } = useCensusData();
  const { fetchFederalElectionData } = useFederalElectionData();
  const { fetchLocationIndexData } = useLocationIndexData();
  const { fetchParticlePollutionData } = useParticlePollutionData();

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { fetchSnapshot, saveSnapshotConfig } = useLocationData(true);
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const [snapshotResponse, setSnapshotResponse] =
    useState<ApiSearchResultSnapshotResponse>();
  const [mapBoxToken, setMapBoxToken] = useState("");
  const [editorTabProps, setEditorTabProps] = useState<IEditorTabProps>();
  const [exportTabProps, setExportTabProps] = useState<IExportTabProps>();

  // initialization
  useEffect(() => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
      payload: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const prepareSnapshotData = async () => {
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
              config.realEstateStatus === ApiRealEstateStatusEnum.ALL ||
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

      searchContextDispatch({
        type: SearchContextActionTypes.SET_CENSUS_DATA,
        payload: await fetchCensusData(
          snapshotResponse.snapshot.location
        ),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA,
        payload: await fetchFederalElectionData(
          snapshotResponse.snapshot.location
        ),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PARTICLE_POLLUTION_DATA,
        payload: await fetchParticlePollutionData(
          snapshotResponse.snapshot.location
        ),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION_INDEX_DATA,
        payload: await fetchLocationIndexData(
          snapshotResponse.snapshot.location
        ),
      });

      const enhancedConfig = {
        ...config,
        fixedRealEstates: config.fixedRealEstates ?? true,
        defaultActiveMeans: config.defaultActiveMeans?.length
          ? config.defaultActiveMeans
          : deriveAvailableMeansFromResponse(searchResponse),
      };

      const editorGroups = deriveInitialEntityGroups(
        searchResponse,
        enhancedConfig,
        filteredRealEstateListings,
        preferredLocations,
        true
      );

      setEditorTabProps({
        availableMeans: deriveAvailableMeansFromResponse(searchResponse),
        groupedEntries: editorGroups,
        config: searchContextState.responseConfig!,
        onConfigChange: (config: ApiSearchResultSnapshotConfig) => {
          if (
            searchContextState.responseConfig?.mapBoxMapId !==
              config.mapBoxMapId ||
            searchContextState.responseConfig?.showLocation !==
              config.showLocation ||
            searchContextState.responseConfig?.showAddress !==
              config.showAddress
          ) {
            const mapCenter =
              mapRef.current?.getCenter() || searchContextState.mapCenter;
            const mapZoomLevel =
              mapRef.current?.getZoom() || searchContextState.mapZoomLevel;

            if (mapCenter && mapZoomLevel) {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_MAP_CENTER_ZOOM,
                payload: { mapCenter, mapZoomLevel },
              });
            }
          }

          searchContextDispatch({
            type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
            payload: { ...config },
          });
        },
        snapshotId,
        // additionalMapBoxStyles: userState?.user?.additionalMapBoxStyles || [],
        additionalMapBoxStyles: [],
        isNewSnapshot: !!state?.isNewSnapshot,
      });

      setExportTabProps({
        snapshotId,
        codeSnippet: createCodeSnippet(snapshotResponse.token),
        directLink: createDirectLink(snapshotResponse.token),
        searchAddress: placesLocation.label,
      });
    };

    void prepareSnapshotData();

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
        ref={mapRef}
        mapBoxToken={mapBoxToken}
        mapBoxMapId={snapshotResponse?.config?.mapBoxMapId}
        searchResponse={searchContextState.searchResponse!}
        searchAddress={searchContextState.placesLocation?.label}
        location={searchContextState.mapCenter ?? searchContextState.location!}
        editorTabProps={editorTabProps}
        exportTabProps={exportTabProps}
        mapDisplayMode={MapDisplayModesEnum.EDITOR}
        saveConfig={async () => {
          await saveSnapshotConfig(
            mapRef,
            snapshotId,
            snapshotResponse?.snapshot!
          );
        }}
        isTrial={false}
      />
    </>
  );
};

export default MapPage;

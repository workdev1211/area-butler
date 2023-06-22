import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useParams } from "react-router-dom";

import "./MapPage.scss";

import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from "../../../../shared/types/real-estate";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { getCombinedOsmEntityTypes } from "../../../../shared/functions/shared.functions";
import {
  defaultMapZoom,
  googleMapsApiOptions,
} from "../../shared/shared.constants";
import {
  buildEntityData,
  deriveAvailableMeansFromResponse,
  deriveInitialEntityGroups,
} from "../../shared/shared.functions";
import {
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  ApiTourNamesEnum,
  MapDisplayModesEnum,
} from "../../../../shared/types/types";
import SearchResultContainer, {
  EntityGroup,
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
import { useTools } from "../../hooks/tools";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { ConfigContext } from "../../context/ConfigContext";

const MapPage: FunctionComponent = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { googleApiKey } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { state } = useLocation<IMapPageHistoryState>();
  const { snapshotId } = useParams<SnippetEditorRouterProps>();

  const { fetchCensusData } = useCensusData();
  const { fetchFederalElectionData } = useFederalElectionData();
  const { fetchLocationIndexData } = useLocationIndexData();
  const { fetchParticlePollutionData } = useParticlePollutionData();

  const { fetchSnapshot, saveSnapshotConfig } = useLocationData();
  const { createDirectLink, createCodeSnippet } = useTools();

  const [snapshotResponse, setSnapshotResponse] =
    useState<ApiSearchResultSnapshotResponse>();
  const [mapBoxToken, setMapBoxToken] = useState("");
  const [processedRealEstates, setProcessedRealEstates] = useState<
    ApiRealEstateListing[]
  >([]);
  const [editorGroups, setEditorGroups] = useState<EntityGroup[]>([]);
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
      const config = snapshotResponseData.config;

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

    const filteredRealEstates = config.realEstateStatus
      ? realEstateListings.filter(
          ({ status }) =>
            config.realEstateStatus === ApiRealEstateStatusEnum.ALL ||
            status === config.realEstateStatus
        )
      : realEstateListings;

    setProcessedRealEstates(filteredRealEstates);

    const enhancedConfig = {
      ...config,
      fixedRealEstates: config.fixedRealEstates ?? true,
      defaultActiveMeans: config.defaultActiveMeans?.length
        ? config.defaultActiveMeans
        : deriveAvailableMeansFromResponse(searchResponse),
    };

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
      payload: { ...enhancedConfig },
    });

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
      type: SearchContextActionTypes.SET_RESPONSE_TOKEN,
      payload: snapshotResponse.token,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups(
        searchResponse,
        config,
        filteredRealEstates,
        preferredLocations
      ),
    });

    setEditorGroups(
      deriveInitialEntityGroups(
        searchResponse,
        searchContextState.responseConfig,
        processedRealEstates,
        preferredLocations,
        true
      )
    );

    setExportTabProps({
      snapshotId,
      directLink: createDirectLink(snapshotResponse.token),
      codeSnippet: createCodeSnippet(snapshotResponse.token),
      searchAddress: placesLocation.label,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId, snapshotResponse]);

  useEffect(() => {
    if (!snapshotResponse || !searchContextState.responseConfig) {
      return;
    }

    const {
      snapshot: { searchResponse },
    } = snapshotResponse;

    setEditorTabProps({
      config: searchContextState.responseConfig,
      availableMeans: deriveAvailableMeansFromResponse(searchResponse),
      groupedEntries: editorGroups,
      onConfigChange: (config: ApiSearchResultSnapshotConfig): void => {
        if (
          searchContextState.responseConfig?.mapBoxMapId !==
            config.mapBoxMapId ||
          searchContextState.responseConfig?.showLocation !==
            config.showLocation ||
          searchContextState.responseConfig?.showAddress !== config.showAddress
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
      // TODO implement for the integration user
      // additionalMapBoxStyles: userState?.user?.additionalMapBoxStyles || [],
      additionalMapBoxStyles: [],
      isNewSnapshot: !!state?.isNewSnapshot,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    processedRealEstates,
    searchContextState.mapCenter,
    searchContextState.mapZoomLevel,
    searchContextState.responseConfig,
    snapshotId,
    snapshotResponse,
    state?.isNewSnapshot,
    editorGroups,
  ]);

  // react to changes
  useEffect(() => {
    if (!snapshotResponse) {
      return;
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups(
        snapshotResponse.snapshot.searchResponse,
        searchContextState.responseConfig,
        processedRealEstates,
        snapshotResponse?.snapshot.preferredLocations
      ),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextState.responseConfig?.defaultActiveGroups,
    searchContextState.responseConfig?.entityVisibility,
    searchContextState.responseConfig?.realEstateStatus,
    searchContextState.responseConfig?.poiFilter,
    snapshotResponse,
    processedRealEstates,
  ]);

  useEffect(() => {
    if (!snapshotResponse) {
      return;
    }

    const fetchAreaStats = async () => {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_CENSUS_DATA,
        payload: await fetchCensusData(snapshotResponse.snapshot.location),
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
    };

    void fetchAreaStats();

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

  const onPoiAdd = (poi: ApiOsmLocation): void => {
    if (!snapshotResponse) {
      return;
    }

    const copiedSearchResponse: ApiSearchResponse = JSON.parse(
      JSON.stringify(snapshotResponse.snapshot.searchResponse)
    );

    copiedSearchResponse?.routingProfiles?.WALK?.locationsOfInterest?.push(
      poi as any as ApiOsmLocation
    );
    copiedSearchResponse?.routingProfiles?.BICYCLE?.locationsOfInterest?.push(
      poi as any as ApiOsmLocation
    );
    copiedSearchResponse?.routingProfiles?.CAR?.locationsOfInterest?.push(
      poi as any as ApiOsmLocation
    );

    const newEntity = buildEntityData(
      copiedSearchResponse,
      searchContextState.responseConfig
    )?.find((e) => e.id === poi.entity.id)!;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: (searchContextState.responseGroupedEntities ?? []).map((ge) =>
        ge.title !== poi.entity.label
          ? ge
          : {
              ...ge,
              items: [...ge.items, newEntity],
            }
      ),
    });

    // update dedicated entity groups for editor
    setEditorGroups(
      editorGroups.map((ge) =>
        ge.title !== poi.entity.label
          ? ge
          : { ...ge, items: [...ge.items, newEntity] }
      )
    );
  };

  if (
    !searchContextState.searchResponse ||
    !searchContextState.responseConfig ||
    !mapBoxToken ||
    !editorTabProps ||
    !exportTabProps
  ) {
    return <LoadingMessage />;
  }

  return (
    <>
      <TourStarter tour={ApiTourNamesEnum.INT_MAP} />
      <div className="hidden">
        <GooglePlacesAutocomplete
          apiOptions={googleMapsApiOptions}
          autocompletionRequest={{
            componentRestrictions: {
              country: ["de"],
            },
          }}
          minLengthAutocomplete={5}
          selectProps={{}}
          apiKey={googleApiKey}
        />
      </div>
      <SearchResultContainer
        ref={mapRef}
        mapBoxToken={mapBoxToken}
        mapBoxMapId={searchContextState.responseConfig?.mapBoxMapId}
        searchResponse={searchContextState.searchResponse}
        searchAddress={searchContextState.placesLocation?.label}
        location={searchContextState.mapCenter ?? searchContextState.location!}
        editorTabProps={editorTabProps}
        exportTabProps={exportTabProps}
        mapDisplayMode={MapDisplayModesEnum.EDITOR}
        onPoiAdd={onPoiAdd}
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

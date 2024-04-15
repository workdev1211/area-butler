import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useParams } from "react-router-dom";

import "./MapPage.scss";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { getCombinedOsmEntityTypes } from "../../../../shared/functions/shared.functions";
import { defaultMapZoom } from "../../shared/shared.constants";
import {
  buildEntityData,
  deriveAvailableMeansFromResponse,
  deriveInitialEntityGroups,
} from "../../shared/shared.functions";
import {
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotResponse,
  ApiTourNamesEnum,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../shared/types/types";
import SearchResultContainer from "../../components/search-result-container/SearchResultContainer";
import { EntityGroup, ICurrentMapRef } from "../../shared/search-result.types";
import { useLocationData } from "../../hooks/locationdata";
import { SnapshotEditorRouterProps } from "../../pages/SnapshotEditorPage";
import TourStarter from "../../tour/TourStarter";
import { IMapPageHistoryState } from "../../shared/shared.types";
import { useCensusData } from "../../hooks/censusdata";
import { useFederalElectionData } from "../../hooks/federalelectiondata";
import { useParticlePollutionData } from "../../hooks/particlepollutiondata";
import { useLocationIndexData } from "../../hooks/locationindexdata";
import { LoadingMessage } from "../../components/Loading";
import { RealEstateContext } from "../../context/RealEstateContext";
import { filterRealEstates } from "../../shared/real-estate.functions";
import { useRealEstateData } from "../../hooks/realestatedata";

const MapPage: FunctionComponent = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const {
    realEstateState: { listings },
  } = useContext(RealEstateContext);

  const { state } = useLocation<IMapPageHistoryState>();
  const { snapshotId } = useParams<SnapshotEditorRouterProps>();

  const { fetchCensusData } = useCensusData();
  const { fetchFederalElectionData } = useFederalElectionData();
  const { fetchLocationIndexData } = useLocationIndexData();
  const { fetchParticlePollutionData } = useParticlePollutionData();

  const { fetchSnapshot, saveSnapshotConfig } = useLocationData();
  const { fetchRealEstates } = useRealEstateData();

  const [snapshotRes, setSnapshotRes] =
    useState<ApiSearchResultSnapshotResponse>();
  const [mapboxAccessToken, setMapboxAccessToken] = useState("");
  const [processedRealEstates, setProcessedRealEstates] = useState<
    ApiRealEstateListing[]
  >([]);
  const [editorGroups, setEditorGroups] = useState<EntityGroup[]>([]);

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

    const fetchSnapshotData = async () => {
      const snapshotRes = await fetchSnapshot(snapshotId);
      const config = snapshotRes.config;

      if (!listings) {
        await fetchRealEstates();
      }

      if (config && !("showAddress" in config)) {
        config["showAddress"] = true;
      }

      if (config && !("showStreetViewLink" in config)) {
        config["showStreetViewLink"] = true;
      }

      setSnapshotRes(snapshotRes);
      setMapboxAccessToken(snapshotRes.mapboxAccessToken);
    };

    void fetchSnapshotData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  useEffect(() => {
    if (!snapshotRes || !snapshotRes.config) {
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
      },
      config,
    } = snapshotRes;

    const filteredRealEstates = filterRealEstates(config, listings);
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
      payload: snapshotRes.token,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_SNAPSHOT_ID,
      payload: snapshotId,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: snapshotRes.realEstateListing,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        searchResponse,
        config: enhancedConfig,
        listings: filteredRealEstates,
        locations: preferredLocations,
      }),
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_AVAIL_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        searchResponse,
        config: enhancedConfig,
        listings: filteredRealEstates,
        locations: preferredLocations,
        ignoreVisibility: true,
        ignorePoiFilter: true,
      }),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId, snapshotRes, listings]);

  // react to changes
  useEffect(() => {
    if (!snapshotRes) {
      return;
    }

    const filteredRealEstates = filterRealEstates(
      searchContextState.responseConfig,
      listings
    );

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        searchResponse: snapshotRes.snapshot.searchResponse,
        config: searchContextState.responseConfig,
        listings: filteredRealEstates,
        locations: snapshotRes.snapshot.preferredLocations,
      }),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextState.responseConfig?.entityVisibility,
    searchContextState.responseConfig?.realEstateStatus,
    searchContextState.responseConfig?.realEstateStatus2,
    searchContextState.responseConfig?.poiFilter,
    snapshotRes,
    processedRealEstates,
  ]);

  useEffect(() => {
    if (!snapshotRes) {
      return;
    }

    const fetchAreaStats = async () => {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_CENSUS_DATA,
        payload: await fetchCensusData(snapshotRes.snapshot.location),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA,
        payload: await fetchFederalElectionData(snapshotRes.snapshot.location),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PARTICLE_POLLUTION_DATA,
        payload: await fetchParticlePollutionData(
          snapshotRes.snapshot.location
        ),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION_INDEX_DATA,
        payload: await fetchLocationIndexData(snapshotRes.snapshot.location),
      });
    };

    void fetchAreaStats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotRes]);

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
    if (!snapshotRes) {
      return;
    }

    const copiedSearchResponse: ApiSearchResponse = JSON.parse(
      JSON.stringify(snapshotRes.snapshot.searchResponse)
    );

    Object.values(MeansOfTransportation).forEach((transportParam) => {
      if (
        copiedSearchResponse?.routingProfiles &&
        copiedSearchResponse.routingProfiles[transportParam]
      ) {
        copiedSearchResponse.routingProfiles[
          transportParam
        ].locationsOfInterest?.push(poi);
      }
    });

    const newEntity = buildEntityData(
      copiedSearchResponse,
      searchContextState.responseConfig
    )?.find((e) => e.id === poi.entity.id);

    if (!newEntity) {
      return;
    }

    newEntity.isCustom = true;

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

    searchContextDispatch({
      type: SearchContextActionTypes.ADD_CUSTOM_POI,
      payload: poi,
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
    !mapboxAccessToken
  ) {
    return <LoadingMessage />;
  }

  return (
    <>
      <TourStarter tour={ApiTourNamesEnum.INT_MAP} />
      <SearchResultContainer
        mapboxAccessToken={mapboxAccessToken}
        searchResponse={searchContextState.searchResponse}
        searchAddress={searchContextState.placesLocation?.label}
        location={searchContextState.mapCenter ?? searchContextState.location!}
        mapDisplayMode={MapDisplayModesEnum.EDITOR}
        onPoiAdd={onPoiAdd}
        saveConfig={async () => {
          await saveSnapshotConfig(mapRef, snapshotId);
        }}
        isTrial={false}
        isNewSnapshot={!!state?.isNewSnapshot}
        ref={mapRef}
      />
    </>
  );
};

export default MapPage;

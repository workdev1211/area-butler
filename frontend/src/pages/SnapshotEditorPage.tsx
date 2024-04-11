import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";

import "./SnapshotEditorPage.scss";

import SearchResultContainer from "components/search-result-container/SearchResultContainer";
import { ICurrentMapRef } from "shared/search-result.types";
import { ConfigContext } from "context/ConfigContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import DefaultLayout from "layout/defaultLayout";
import {
  buildEntityData,
  deriveAvailableMeansFromResponse,
  deriveInitialEntityGroups,
  toastError,
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import {
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiTourNamesEnum,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../shared/types/types";
import {
  ApiDataSource,
  ApiSubscriptionPlanType,
} from "../../../shared/types/subscription-plan";
import { useCensusData } from "../hooks/censusdata";
import { useFederalElectionData } from "../hooks/federalelectiondata";
import { useParticlePollutionData } from "../hooks/particlepollutiondata";
import { defaultMapZoom } from "../shared/shared.constants";
import { useLocationIndexData } from "../hooks/locationindexdata";
import { IMapPageHistoryState } from "../shared/shared.types";
import { useLocationData } from "../hooks/locationdata";
import { realEstAllTextStatus } from "../../../shared/constants/real-estate";
import { useTools } from "../hooks/tools";
import { LoadingMessage } from "../components/Loading";
import { useRealEstateData } from "../hooks/realestatedata";

export interface SnapshotEditorRouterProps {
  snapshotId: string;
}

const SnapshotEditorPage: FunctionComponent = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { mapBoxAccessToken: mapboxAccessToken } = useContext(ConfigContext);
  const { searchContextDispatch, searchContextState } =
    useContext(SearchContext);

  const history = useHistory<IMapPageHistoryState>();
  const { state } = useLocation<IMapPageHistoryState>();
  const { snapshotId } = useParams<SnapshotEditorRouterProps>();

  const { getActualUser } = useTools();
  const { fetchSnapshot, saveSnapshotConfig } = useLocationData();
  const { fetchRealEstateByIntId } = useRealEstateData();

  const { fetchCensusData } = useCensusData();
  const { fetchFederalElectionData } = useFederalElectionData();
  const { fetchParticlePollutionData } = useParticlePollutionData();
  const { fetchLocationIndexData } = useLocationIndexData();

  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshot>();
  const [integrationId, setIntegrationId] = useState<string>();

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;
  const isAvailHtmlSnippet =
    isIntegrationUser || !!user?.subscription?.config.appFeatures.htmlSnippet;

  // initialization
  useEffect(() => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
      payload: [],
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: undefined,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetching a snapshot
  useEffect(() => {
    if (!isAvailHtmlSnippet) {
      toastError(
        "Nur das Business+ Abonnement erlaubt die Nutzung des Karten Editors."
      );

      history.push("/profile");
    }

    const fetchSnapshotData = async (): Promise<void> => {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION_INDEX_DATA,
        payload: undefined,
      });

      const snapshotResponse = await fetchSnapshot(snapshotId);

      const snapshotConfig = (snapshotResponse.config ||
        {}) as any as ApiSearchResultSnapshotConfig;

      snapshotConfig.primaryColor =
        snapshotConfig.primaryColor ??
        (isIntegrationUser ? user.config : user).color;
      snapshotConfig.mapIcon =
        snapshotConfig.mapIcon ??
        (isIntegrationUser ? user.config : user).mapIcon;
      snapshotConfig.showAddress = snapshotConfig.showAddress ?? true;
      snapshotConfig.showStreetViewLink =
        snapshotConfig.showStreetViewLink ?? true;

      const enhancedConfig = {
        ...snapshotConfig,
        fixedRealEstates: snapshotConfig.fixedRealEstates ?? true,
        defaultActiveMeans: snapshotConfig.defaultActiveMeans?.length
          ? snapshotConfig.defaultActiveMeans
          : deriveAvailableMeansFromResponse(
              snapshotResponse.snapshot?.searchResponse
            ),
      };

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...enhancedConfig },
      });

      if (enhancedConfig.zoomLevel) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_MAP_ZOOM_LEVEL,
          payload: enhancedConfig.zoomLevel || defaultMapZoom,
        });
      }

      if (!snapshotResponse.snapshot || !snapshotConfig) {
        return;
      }

      const { searchResponse, realEstateListings, preferredLocations } =
        snapshotResponse.snapshot;

      const filteredRealEstates =
        snapshotConfig.realEstateStatus || snapshotConfig.realEstateStatus2
          ? realEstateListings.filter(({ name, status, status2 }) => {
              const filter1 = snapshotConfig.realEstateStatus
                ? snapshotConfig.realEstateStatus === realEstAllTextStatus ||
                  status === snapshotConfig.realEstateStatus
                : true;

              const filter2 = snapshotConfig.realEstateStatus2
                ? snapshotConfig.realEstateStatus2 === realEstAllTextStatus ||
                  status2 === snapshotConfig.realEstateStatus2
                : true;

              return filter1 && filter2;
            })
          : realEstateListings;

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
        type: SearchContextActionTypes.SET_RESPONSE_TOKEN,
        payload: snapshotResponse.token,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION,
        payload: snapshotResponse.snapshot.location,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PLACES_LOCATION,
        payload: snapshotResponse.snapshot.placesLocation,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: snapshotResponse.snapshot.transportationParams,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SNAPSHOT_ID,
        payload: snapshotId,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
        payload: snapshotResponse.snapshot.localityParams,
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

      setSnapshot(snapshotResponse.snapshot);
      setIntegrationId(snapshotResponse.integrationId);
    };

    void fetchSnapshotData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  // setting a real estate listing
  useEffect(() => {
    if (!snapshot) {
      return;
    }

    if (!isIntegrationUser) {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
        payload: snapshot.realEstateListing || undefined,
      });

      return;
    }

    if (
      !integrationId ||
      integrationId === searchContextState.realEstateListing?.integrationId
    ) {
      return;
    }

    const getRealEstate = (): Promise<void> =>
      fetchRealEstateByIntId(integrationId!);

    void getRealEstate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  // fetching location statistics
  useEffect(() => {
    if (!snapshot) {
      return;
    }

    const fetchLocationStatistics = async () => {
      const isAvailCensus =
        isIntegrationUser ||
        !!user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.CENSUS
        );
      const isAvailElection =
        isIntegrationUser ||
        !!user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.FEDERAL_ELECTION
        );
      const isAvailPollution =
        isIntegrationUser ||
        !!user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.PARTICLE_POLLUTION
        );
      const isAvailIndices =
        isIntegrationUser ||
        !!user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.LOCATION_INDICES
        );

      if (isAvailCensus) {
        const censusData = await fetchCensusData(snapshot.location);

        searchContextDispatch({
          type: SearchContextActionTypes.SET_CENSUS_DATA,
          payload: censusData,
        });
      }

      if (isAvailElection) {
        const federalElectionData = await fetchFederalElectionData(
          snapshot.location
        );

        searchContextDispatch({
          type: SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA,
          payload: federalElectionData!,
        });
      }

      if (isAvailPollution) {
        const particlePollutionData = await fetchParticlePollutionData(
          snapshot.location
        );

        searchContextDispatch({
          type: SearchContextActionTypes.SET_PARTICLE_POLLUTION_DATA,
          payload: particlePollutionData,
        });
      }

      if (isAvailIndices) {
        const locationIndexData = await fetchLocationIndexData(
          snapshot.location
        );

        searchContextDispatch({
          type: SearchContextActionTypes.SET_LOCATION_INDEX_DATA,
          payload: locationIndexData,
        });
      }
    };

    void fetchLocationStatistics();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  // react to changes
  useEffect(() => {
    if (!snapshot) {
      return;
    }

    const confRealEstStatus =
      searchContextState.responseConfig?.realEstateStatus;
    const confRealEstStatus2 =
      searchContextState.responseConfig?.realEstateStatus2;

    const filteredRealEstates =
      confRealEstStatus || confRealEstStatus2
        ? snapshot.realEstateListings.filter(({ name, status, status2 }) => {
            const filter1 = confRealEstStatus
              ? confRealEstStatus === realEstAllTextStatus ||
                status === confRealEstStatus
              : true;

            const filter2 = confRealEstStatus2
              ? confRealEstStatus2 === realEstAllTextStatus ||
                status2 === confRealEstStatus2
              : true;

            return filter1 && filter2;
          })
        : snapshot.realEstateListings;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        searchResponse: snapshot?.searchResponse!,
        config: searchContextState.responseConfig,
        listings: filteredRealEstates,
        locations: snapshot.preferredLocations,
      }),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextState.responseConfig?.entityVisibility,
    searchContextState.responseConfig?.realEstateStatus,
    searchContextState.responseConfig?.realEstateStatus2,
    searchContextState.responseConfig?.poiFilter,
  ]);

  const onPoiAdd = (poi: ApiOsmLocation): void => {
    if (!snapshot) {
      return;
    }

    const copiedSearchResponse: ApiSearchResponse = JSON.parse(
      JSON.stringify(snapshot.searchResponse)
    );

    if (!copiedSearchResponse) {
      return;
    }

    Object.values(MeansOfTransportation).forEach((transportParam) => {
      copiedSearchResponse.routingProfiles[
        transportParam
      ]?.locationsOfInterest?.push(poi);
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
  };

  if (!snapshot) {
    return <LoadingMessage />;
  }

  return (
    <DefaultLayout withHorizontalPadding={false}>
      <TourStarter tour={ApiTourNamesEnum.EDITOR} />
      <div className="editor-container">
        <SearchResultContainer
          mapboxAccessToken={mapboxAccessToken}
          searchResponse={snapshot.searchResponse}
          searchAddress={snapshot.placesLocation.label}
          location={snapshot.location}
          saveConfig={async () => {
            await saveSnapshotConfig(mapRef, snapshotId);
          }}
          mapDisplayMode={MapDisplayModesEnum.EDITOR}
          onPoiAdd={onPoiAdd}
          isTrial={
            isIntegrationUser
              ? false
              : user?.subscription?.type === ApiSubscriptionPlanType.TRIAL
          }
          isNewSnapshot={!!state?.isNewSnapshot}
          ref={mapRef}
        />
      </div>
    </DefaultLayout>
  );
};

export default SnapshotEditorPage;

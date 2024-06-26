import {
  CSSProperties,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SearchResultContainer from "components/search-result-container/SearchResultContainer";
import { ICurrentMapRef } from "shared/search-result.types";
import { ConfigContext } from "context/ConfigContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import DefaultLayout from "layout/defaultLayout";
import {
  deriveAvailableMeansFromResponse,
  toastError,
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import {
  ApiOsmLocation,
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
import { useTools } from "../hooks/tools";
import { Loading } from "../components/Loading";
import { RealEstateContext } from "../context/RealEstateContext";
import { filterRealEstates } from "../shared/real-estate.functions";
import { useRealEstateData } from "../hooks/realestatedata";
import {
  convertLocationToResEntity,
  deriveInitialEntityGroups,
  setTransportParamForResEntity,
} from "../shared/pois.functions";
import { IntegrationTypesEnum } from "../../../shared/types/integration";
import { IntlKeys } from "../i18n/keys";

export interface SnapshotEditorRouterProps {
  snapshotId: string;
}

const SnapshotEditorPage: FC = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { integrationType, mapBoxAccessToken: mapboxAccessToken } =
    useContext(ConfigContext);
  const { searchContextDispatch, searchContextState } =
    useContext(SearchContext);
  const {
    realEstateState: { listings },
  } = useContext(RealEstateContext);

  const history = useHistory<IMapPageHistoryState>();
  const { state } = useLocation<IMapPageHistoryState>();
  const { snapshotId } = useParams<SnapshotEditorRouterProps>();

  const { getActualUser } = useTools();
  const { fetchSnapshot, saveSnapshotConfig } = useLocationData();
  const { fetchRealEstates } = useRealEstateData();
  const { t } = useTranslation();

  const { fetchCensusData } = useCensusData();
  const { fetchFederalElectionData } = useFederalElectionData();
  const { fetchParticlePollutionData } = useParticlePollutionData();
  const { fetchLocationIndexData } = useLocationIndexData();

  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshot>();
  const [isErrorOccurred, setIsErrorOccurred] = useState(false);

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
      toastError(t(IntlKeys.snapshotEditor.notAllowedToUse));

      history.push("/profile");
    }

    const fetchSnapshotData = async (): Promise<void> => {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION_INDEX_DATA,
        payload: undefined,
      });

      const snapshotRes = await fetchSnapshot(snapshotId).catch((e) => {
        console.error(e);
        setIsErrorOccurred(true);
      });

      if (!snapshotRes) {
        return;
      }

      const snapshotConfig = (snapshotRes.config ||
        {}) as any as ApiSearchResultSnapshotConfig;
      let realEstates = listings;

      if (!realEstates.length) {
        realEstates = await fetchRealEstates();
      }

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
        defaultActiveMeans: snapshotConfig.defaultActiveMeans?.length
          ? snapshotConfig.defaultActiveMeans
          : deriveAvailableMeansFromResponse(
              snapshotRes.snapshot?.searchResponse
            ),
      };

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...enhancedConfig },
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_RESPONSE,
        payload: snapshotRes.snapshot.searchResponse,
      });

      if (enhancedConfig.zoomLevel) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_MAP_ZOOM_LEVEL,
          payload: enhancedConfig.zoomLevel || defaultMapZoom,
        });
      }

      if (!snapshotRes.snapshot || !snapshotConfig) {
        return;
      }

      const {
        addressToken,
        token,
        unaddressToken,
        snapshot: { location, preferredLocations, searchResponse },
      } = snapshotRes;

      const filteredRealEstates = filterRealEstates({
        location,
        realEstates,
        config: snapshotConfig,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups({
          preferredLocations,
          searchResponse,
          config: enhancedConfig,
          realEstates: filteredRealEstates,
        }),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_TOKENS,
        payload: { addressToken, token, unaddressToken },
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION,
        payload: snapshotRes.snapshot.location,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PLACES_LOCATION,
        payload: snapshotRes.snapshot.placesLocation,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: snapshotRes.snapshot.transportationParams,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SNAPSHOT_ID,
        payload: snapshotId,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
        payload: snapshotRes.snapshot.localityParams,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_AVAIL_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups({
          preferredLocations,
          searchResponse,
          config: enhancedConfig,
          ignorePoiFilter: true,
          ignoreVisibility: true,
          realEstates: filteredRealEstates,
        }),
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
        payload: snapshotRes.snapshot.realEstate,
      });

      setSnapshot(snapshotRes.snapshot);
    };

    void fetchSnapshotData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

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

    const filteredRealEstates = filterRealEstates({
      config: searchContextState.responseConfig,
      location: searchContextState.location,
      realEstates: listings,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        config: searchContextState.responseConfig,
        preferredLocations: snapshot.preferredLocations,
        realEstates: filteredRealEstates,
        searchResponse: snapshot?.searchResponse!,
      }),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    listings,
    searchContextState.responseConfig?.entityVisibility,
    searchContextState.responseConfig?.hiddenGroups,
    searchContextState.responseConfig?.poiFilter,
    searchContextState.responseConfig?.realEstateStatus,
    searchContextState.responseConfig?.realEstateStatus2,
  ]);

  const onPoiAdd = (poiLocation: ApiOsmLocation): void => {
    if (!snapshot) {
      return;
    }

    const newEntity = convertLocationToResEntity(poiLocation);

    if (!newEntity) {
      return;
    }

    // TODO should be based on isochrones and distances
    Object.keys(snapshot.searchResponse.routingProfiles).forEach(
      (transportParam) => {
        setTransportParamForResEntity(
          newEntity,
          transportParam as MeansOfTransportation
        );
      }
    );

    newEntity.isCustom = true;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: (searchContextState.responseGroupedEntities ?? []).map((ge) =>
        ge.title !== poiLocation.entity.label
          ? ge
          : {
              ...ge,
              items: [...ge.items, newEntity],
            }
      ),
    });

    searchContextDispatch({
      type: SearchContextActionTypes.ADD_CUSTOM_POI,
      payload: poiLocation,
    });
  };

  const styles: CSSProperties =
    integrationType === IntegrationTypesEnum.MY_VIVENDA
      ? {
          height: "100vh",
          maxHeight: "100vh",
        }
      : {
          height: "calc(100vh - var(--nav-height))",
          maxHeight: "calc(100vh - var(--nav-height))",
        };

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        {isErrorOccurred ? t(IntlKeys.common.errorOccurred) : <Loading />}
      </div>
    );
  }

  return (
    <DefaultLayout withHorizontalPadding={false}>
      <TourStarter tour={ApiTourNamesEnum.EDITOR} />
      <div className="editor-container flex relative w-full" style={styles}>
        <SearchResultContainer
          mapboxAccessToken={mapboxAccessToken}
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

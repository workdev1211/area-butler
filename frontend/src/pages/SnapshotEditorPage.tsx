import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useHistory, useLocation, useParams } from "react-router-dom";

import "./SnapshotEditorPage.scss";

import CodeSnippetModal from "components/CodeSnippetModal";
import SearchResultContainer, {
  EntityGroup,
  ICurrentMapRef,
} from "components/SearchResultContainer";
import { ConfigContext } from "context/ConfigContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { UserContext } from "context/UserContext";
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
} from "../../../shared/types/types";
import {
  ApiDataSource,
  ApiSubscriptionPlanType,
} from "../../../shared/types/subscription-plan";
import { useCensusData } from "../hooks/censusdata";
import { useFederalElectionData } from "../hooks/federalelectiondata";
import { useParticlePollutionData } from "../hooks/particlepollutiondata";
import {
  defaultMapZoom,
  googleMapsApiOptions,
} from "../shared/shared.constants";
import { ApiRealEstateStatusEnum } from "../../../shared/types/real-estate";
import { useLocationIndexData } from "../hooks/locationindexdata";
import { IMapPageHistoryState } from "../shared/shared.types";
import { useLocationData } from "../hooks/locationdata";
import { useTools } from "../hooks/tools";

export interface SnapshotEditorRouterProps {
  snapshotId: string;
}

const SnapshotEditorPage: FunctionComponent = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { googleApiKey, mapBoxAccessToken } = useContext(ConfigContext);
  const { userState } = useContext(UserContext);
  const { searchContextDispatch, searchContextState } =
    useContext(SearchContext);

  const history = useHistory<IMapPageHistoryState>();
  const { state } = useLocation<IMapPageHistoryState>();
  const { snapshotId } = useParams<SnapshotEditorRouterProps>();

  const { fetchSnapshot, saveSnapshotConfig } = useLocationData();
  const { fetchCensusData } = useCensusData();
  const { fetchFederalElectionData } = useFederalElectionData();
  const { fetchParticlePollutionData } = useParticlePollutionData();
  const { fetchLocationIndexData } = useLocationIndexData();
  const { createDirectLink, createCodeSnippet } = useTools();

  const [isShownModal, setIsShownModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshot>();
  const [editorGroups, setEditorGroups] = useState<EntityGroup[]>([]);

  const user = userState.user;
  const hasHtmlSnippet = user?.subscription?.config.appFeatures.htmlSnippet;

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

  useEffect(() => {
    if (!hasHtmlSnippet) {
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

      let snapshotConfig = (snapshotResponse.config ||
        {}) as any as ApiSearchResultSnapshotConfig;

      if (user?.color && !("primaryColor" in snapshotConfig)) {
        snapshotConfig["primaryColor"] = user.color;
      }

      if (user?.mapIcon && !("mapIcon" in snapshotConfig)) {
        snapshotConfig["mapIcon"] = user.mapIcon;
      }

      if (!("showAddress" in snapshotConfig)) {
        snapshotConfig["showAddress"] = true;
      }

      if (!("showStreetViewLink" in snapshotConfig)) {
        snapshotConfig["showStreetViewLink"] = true;
      }

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

      setDirectLink(createDirectLink(snapshotResponse.token));
      setCodeSnippet(createCodeSnippet(snapshotResponse.token));
      setSnapshot(snapshotResponse.snapshot);

      if (!snapshotResponse.snapshot || !snapshotConfig) {
        return;
      }

      const { searchResponse, realEstateListings, preferredLocations } =
        snapshotResponse.snapshot;

      const filteredRealEstateListings = snapshotConfig.realEstateStatus
        ? realEstateListings.filter(
            ({ status }) =>
              snapshotConfig.realEstateStatus === ApiRealEstateStatusEnum.ALL ||
              status === snapshotConfig.realEstateStatus
          )
        : realEstateListings;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups({
          searchResponse,
          config: enhancedConfig,
          listings: filteredRealEstateListings,
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
        type: SearchContextActionTypes.CLEAR_REAL_ESTATE_LISTING,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SNAPSHOT_ID,
        payload: snapshotId,
      });

      if (snapshotResponse.snapshot.realEstateListing) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
          payload: snapshotResponse.snapshot.realEstateListing,
        });
      }

      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
        payload: snapshotResponse.snapshot.localityParams,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_AVAIL_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups({
          searchResponse,
          config: enhancedConfig,
          listings: filteredRealEstateListings,
          locations: preferredLocations,
          ignoreVisibility: true,
          ignorePoiFilter: true,
        }),
      });

      // use dedicated entity groups for editor (do not exclude any group by config)
      setEditorGroups(
        deriveInitialEntityGroups({
          searchResponse,
          config: enhancedConfig,
          listings: filteredRealEstateListings,
          locations: preferredLocations,
          ignoreVisibility: true,
        })
      );
    };

    void fetchSnapshotData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  useEffect(() => {
    const fetchLocationStatistics = async () => {
      if (!snapshot) {
        return;
      }

      if (
        user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.CENSUS
        )
      ) {
        const censusData = await fetchCensusData(snapshot.location);

        searchContextDispatch({
          type: SearchContextActionTypes.SET_CENSUS_DATA,
          payload: censusData,
        });
      }

      if (
        user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.FEDERAL_ELECTION
        )
      ) {
        const federalElectionData = await fetchFederalElectionData(
          snapshot.location
        );

        searchContextDispatch({
          type: SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA,
          payload: federalElectionData!,
        });
      }

      if (
        user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.PARTICLE_POLLUTION
        )
      ) {
        const particlePollutionData = await fetchParticlePollutionData(
          snapshot.location
        );

        searchContextDispatch({
          type: SearchContextActionTypes.SET_PARTICLE_POLLUTION_DATA,
          payload: particlePollutionData,
        });
      }

      if (
        user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.LOCATION_INDICES
        )
      ) {
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

    const configRealEstateStatus =
      searchContextState.responseConfig?.realEstateStatus;

    const filteredRealEstateListings = configRealEstateStatus
      ? snapshot.realEstateListings.filter(
          ({ status }) =>
            configRealEstateStatus === ApiRealEstateStatusEnum.ALL ||
            status === configRealEstateStatus
        )
      : snapshot.realEstateListings;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        searchResponse: snapshot?.searchResponse!,
        config: searchContextState.responseConfig,
        listings: filteredRealEstateListings,
        locations: snapshot.preferredLocations,
      }),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextState.responseConfig?.defaultActiveGroups,
    searchContextState.responseConfig?.entityVisibility,
    searchContextState.responseConfig?.realEstateStatus,
    searchContextState.responseConfig?.poiFilter,
  ]);

  if (!snapshot) {
    return <div>Lade Daten...</div>;
  }

  const onPoiAdd = (poi: ApiOsmLocation) => {
    if (!snapshot) {
      return;
    }

    const copiedSearchResponse = JSON.parse(
      JSON.stringify(snapshot!.searchResponse)
    ) as ApiSearchResponse;

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

  return (
    <>
      <DefaultLayout withHorizontalPadding={false}>
        <TourStarter tour={ApiTourNamesEnum.EDITOR} />
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
        {isShownModal && (
          <CodeSnippetModal
            directLink={directLink}
            codeSnippet={codeSnippet}
            label={snapshot.placesLocation.label}
            closeModal={() => {
              setIsShownModal(false);
            }}
          />
        )}
        <div className="editor-container">
          <SearchResultContainer
            mapBoxToken={mapBoxAccessToken}
            mapBoxMapId={searchContextState.responseConfig?.mapBoxMapId}
            searchResponse={snapshot.searchResponse}
            searchAddress={snapshot.placesLocation.label}
            location={snapshot.location}
            saveConfig={async () => {
              await saveSnapshotConfig(mapRef, snapshotId, snapshot);
            }}
            mapDisplayMode={MapDisplayModesEnum.EDITOR}
            onPoiAdd={onPoiAdd}
            isTrial={user?.subscription?.type === ApiSubscriptionPlanType.TRIAL}
            isNewSnapshot={!!state?.isNewSnapshot}
            ref={mapRef}
          />
        </div>
      </DefaultLayout>
    </>
  );
};

export default SnapshotEditorPage;

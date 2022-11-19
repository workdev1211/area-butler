import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useHistory, useParams } from "react-router-dom";
import * as L from "leaflet";

import CodeSnippetModal from "components/CodeSnippetModal";
import SearchResultContainer, {
  EntityGroup,
  IEditorTabProps,
  IExportTabProps,
} from "components/SearchResultContainer";
import { ConfigContext } from "context/ConfigContext";
import {
  Poi,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import DefaultLayout from "layout/defaultLayout";
import {
  buildEntityData,
  createCodeSnippet,
  createDirectLink,
  deriveAvailableMeansFromResponse,
  deriveInitialEntityGroups,
  toastError,
  toastSuccess,
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import {
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  ApiUpdateSearchResultSnapshot,
} from "../../../shared/types/types";
import "./SnippetEditorPage.scss";
import {
  ApiDataSource,
  ApiSubscriptionPlanType,
} from "../../../shared/types/subscription-plan";
import { useCensusData } from "../hooks/censusdata";
import { useFederalElectionData } from "../hooks/federalelectiondata";
import { useParticlePollutionData } from "../hooks/particlepollutiondata";
import { defaultMapZoom } from "../map/Map";
import { googleMapsApiOptions } from "../shared/shared.constants";
import { ApiRealEstateStatusEnum } from "../../../shared/types/real-estate";
import OpenAiLocationDescriptionModal from "../components/OpenAiLocationDescriptionModal";

export interface SnippetEditorRouterProps {
  snapshotId: string;
}

const SnippetEditorPage: FunctionComponent = () => {
  const history = useHistory();
  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { get, put } = useHttp();
  const { fetchNearData } = useCensusData();
  const { fetchElectionData } = useFederalElectionData();
  const { fetchParticlePollutionData } = useParticlePollutionData();
  const mapRef = useRef<L.Map | null>(null);

  const [isShownModal, setIsShownModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshot>();
  const [editorGroups, setEditorGroups] = useState<EntityGroup[]>([]);
  const [isShownAiDescriptionModal, setIsShownAiDescriptionModal] =
    useState(false);

  const { googleApiKey, mapBoxAccessToken } = useContext(ConfigContext);
  const { userState } = useContext(UserContext);
  const { searchContextDispatch, searchContextState } =
    useContext(SearchContext);

  const user = userState.user;

  const hasOpenAiFeature = user?.subscription?.config.appFeatures.openAi;
  const hasHtmlSnippet = user?.subscription?.config.appFeatures.htmlSnippet;

  useEffect(() => {
    if (!hasHtmlSnippet) {
      toastError(
        "Nur das Business+ Abonnement erlaubt die Nutzung des Karten Editors."
      );

      history.push("/profile");
    }

    const fetchSnapshot = async () => {
      const snapshotResponse = (
        await get<ApiSearchResultSnapshotResponse>(
          `/api/location/snapshot/${snapshotId}`
        )
      ).data;

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
              snapshotConfig.realEstateStatus ===
                ApiRealEstateStatusEnum.ALLE ||
              status === snapshotConfig.realEstateStatus
          )
        : realEstateListings;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups(
          searchResponse,
          enhancedConfig,
          filteredRealEstateListings,
          preferredLocations
        ),
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

      if (snapshotResponse.snapshot.realEstateListing) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
          payload: snapshotResponse.snapshot.realEstateListing,
        });
      }

      if (
        user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.CENSUS
        )
      ) {
        const zensusData = await fetchNearData(
          snapshotResponse.snapshot.location
        );

        searchContextDispatch({
          type: SearchContextActionTypes.SET_ZENSUS_DATA,
          payload: zensusData!,
        });
      }

      if (
        user?.subscription?.config.appFeatures.dataSources.includes(
          ApiDataSource.FEDERAL_ELECTION
        )
      ) {
        const federalElectionData = await fetchElectionData(
          snapshotResponse.snapshot.location!
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
          snapshotResponse.snapshot.location!
        );

        searchContextDispatch({
          type: SearchContextActionTypes.SET_PARTICLE_POLLUTION_ELECTION_DATA,
          payload: particlePollutionData,
        });
      }

      // use dedicated entity groups for editor (do not exclude any group by config)
      setEditorGroups(
        deriveInitialEntityGroups(
          searchResponse,
          enhancedConfig,
          filteredRealEstateListings,
          preferredLocations,
          true
        )
      );
    };

    void fetchSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

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
            configRealEstateStatus === ApiRealEstateStatusEnum.ALLE ||
            status === configRealEstateStatus
        )
      : snapshot.realEstateListings;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups(
        snapshot?.searchResponse!,
        searchContextState.responseConfig,
        filteredRealEstateListings,
        snapshot.preferredLocations
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextState.responseConfig?.defaultActiveGroups,
    searchContextState.responseConfig?.entityVisibility,
    searchContextState.responseConfig?.realEstateStatus,
  ]);

  const onPoiAdd = (poi: Poi) => {
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

  if (!snapshot) {
    return <div>Lade Daten...</div>;
  }

  // TODO think about using useEffect or memoizing the props
  const editorTabProps: IEditorTabProps = {
    availableMeans: deriveAvailableMeansFromResponse(snapshot.searchResponse),
    groupedEntries: editorGroups,
    config: searchContextState.responseConfig!,
    onConfigChange: (config: ApiSearchResultSnapshotConfig) => {
      if (
        searchContextState.responseConfig?.mapBoxMapId !== config.mapBoxMapId ||
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
    additionalMapBoxStyles: userState?.user?.additionalMapBoxStyles || [],
  };

  const exportTabProps: IExportTabProps = {
    codeSnippet,
    directLink,
    placeLabel: snapshot.placesLocation.label,
    snapshotId,
  };

  return (
    <>
      <DefaultLayout withHorizontalPadding={false}>
        <TourStarter tour="editor" />
        {hasOpenAiFeature && (
          <OpenAiLocationDescriptionModal
            isShownModal={isShownAiDescriptionModal}
            closeModal={() => {
              setIsShownAiDescriptionModal(false);
            }}
            searchResultSnapshotId={snapshotId}
          />
        )}
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
            placesLocation={snapshot.placesLocation}
            location={snapshot.location}
            saveConfig={async () => {
              try {
                const mapZoomLevel = mapRef.current?.getZoom();

                const defaultActiveGroups =
                  searchContextState.responseGroupedEntities?.reduce<string[]>(
                    (result, { title, active }) => {
                      if (active) {
                        result.push(title);
                      }

                      return result;
                    },
                    []
                  );

                const config = {
                  ...searchContextState.responseConfig,
                  defaultActiveGroups,
                };

                if (mapZoomLevel) {
                  config.zoomLevel = mapZoomLevel;
                }

                await put<ApiUpdateSearchResultSnapshot>(
                  `/api/location/snapshot/${snapshotId}`,
                  { config, snapshot }
                );

                toastSuccess("Einstellungen gespeichert!");
              } catch (e) {
                toastError("Fehler beim Speichern der Einstellungen!");
              }
            }}
            editorMode={true}
            onPoiAdd={onPoiAdd}
            isTrial={user?.subscription?.type === ApiSubscriptionPlanType.TRIAL}
            ref={mapRef}
            user={user}
            editorTabProps={editorTabProps}
            exportTabProps={exportTabProps}
          />
        </div>
      </DefaultLayout>
    </>
  );
};

export default SnippetEditorPage;

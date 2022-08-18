import { FunctionComponent, useContext, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useHistory, useParams, useLocation } from "react-router-dom";

import CodeSnippetModal from "components/CodeSnippetModal";
import SearchResultContainer, {
  EntityGroup,
} from "components/SearchResultContainer";
import { ConfigContext } from "context/ConfigContext";
import {
  Poi,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import EditorMapMenu from "map/menu-editor/EditorMapMenu";
import {
  buildEntityData,
  createCodeSnippet,
  createDirectLink,
  deriveAvailableMeansFromResponse,
  deriveEntityGroupsByActiveMeans,
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
import pdfIcon from "../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import copyMapIcon from "../assets/icons/copy-map.svg";
import { subscriptionUpgradeFullyCustomizableExpose } from "./SearchResultPage";
import ExportModal from "../export/ExportModal";
import { ApiDataSource } from "../../../shared/types/subscription-plan";
import { useCensusData } from "../hooks/censusdata";
import { useFederalElectionData } from "../hooks/federalelectiondata";
import { useParticlePollutionData } from "../hooks/particlepollutiondata";
import { defaultMapZoom } from "../map/Map";
import { googleMapsApiOptions } from "../shared/shared.constants";
import FormModal, { ModalConfig } from "../components/FormModal";
import OpenAiLocationFormHandler from "../map-snippets/OpenAiLocationFormHandler";
import { openAiFeatureAllowedEmails } from "../../../shared/constants/exclusion";

export interface SnippetEditorRouterProps {
  snapshotId: string;
}

const SnippetEditorPage: FunctionComponent = () => {
  const history = useHistory();
  const currentLocation = useLocation<{ from: string }>();
  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { get, put } = useHttp();
  const { fetchNearData } = useCensusData();
  const { fetchElectionData } = useFederalElectionData();
  const { fetchParticlePollutionData } = useParticlePollutionData();

  const [showModal, setShowModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshot>();
  const [editorGroups, setEditorGroups] = useState<EntityGroup[]>([]);
  const [mapZoomLevel, setMapZoomLevel] = useState(defaultMapZoom);
  const [isShownOpenAiLocationModal, setIsShownOpenAiLocationModal] =
    useState(false);

  const { googleApiKey, mapBoxAccessToken } = useContext(ConfigContext);
  const { userState, userDispatch } = useContext(UserContext);
  const { searchContextDispatch, searchContextState } =
    useContext(SearchContext);

  const user = userState.user;

  const hasFullyCustomizableExpose =
    user?.subscriptionPlan?.config.appFeatures.fullyCustomizableExpose;

  // TODO allow by user email
  const hasOpenAiFeature =
    openAiFeatureAllowedEmails.includes(user?.email || "") ||
    user?.subscriptionPlan?.config.appFeatures.openAi;

  useEffect(() => {
    if (!user?.subscriptionPlan?.config.appFeatures.htmlSnippet) {
      toastError(
        "Nur das Business+ Abonnement erlaubt die Nutzung des Karten Editors."
      );

      history.push("/profile");
    }

    const fetchSnapshot = async () => {
      const snapshotResponse = (
        await get<ApiSearchResultSnapshotResponse>(
          `/api/location/user-embeddable-maps/${snapshotId}`
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
        setMapZoomLevel(enhancedConfig.zoomLevel);
      }

      setDirectLink(createDirectLink(snapshotResponse.token));
      setCodeSnippet(createCodeSnippet(snapshotResponse.token));
      setSnapshot(snapshotResponse.snapshot);

      if (snapshotResponse.snapshot && snapshotConfig) {
        const { searchResponse, realEstateListings, preferredLocations } =
          snapshotResponse.snapshot;

        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
          payload: deriveInitialEntityGroups(
            searchResponse,
            enhancedConfig,
            realEstateListings,
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
          user?.subscriptionPlan?.config.appFeatures.dataSources.includes(
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
          user?.subscriptionPlan?.config.appFeatures.dataSources.includes(
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
          user?.subscriptionPlan?.config.appFeatures.dataSources.includes(
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
            realEstateListings,
            preferredLocations,
            true
          )
        );
      }
    };

    void fetchSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  // react to changes
  useEffect(() => {
    if (snapshot) {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups(
          snapshot?.searchResponse!,
          searchContextState.responseConfig,
          snapshot.realEstateListings,
          snapshot.preferredLocations
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextState.responseConfig?.defaultActiveGroups,
    searchContextState.responseConfig?.entityVisibility,
  ]);

  const onPoiAdd = (poi: Poi) => {
    if (snapshot) {
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
    }
  };

  const openAiLocationModalConfig: ModalConfig = {
    modalTitle: "Standortbeschreibung generieren",
    submitButtonTitle: "Generieren",
    modalOpen: isShownOpenAiLocationModal,
    postSubmit: (success) => {
      if (!success) {
        // if a user clicks on the "Schließen" button
        setIsShownOpenAiLocationModal(false);
      }
    },
  };

  const OpenAiLocationModal: FunctionComponent<{}> = () => (
    <FormModal modalConfig={openAiLocationModalConfig}>
      <OpenAiLocationFormHandler
        searchResultSnapshotId={snapshotId}
        closeModal={() => {
          // if an error is thrown on the submit step
          setIsShownOpenAiLocationModal(false);
        }}
      />
    </FormModal>
  );

  const ActionsTop: FunctionComponent = () => {
    return (
      <>
        <li>
          <button
            type="button"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                payload: true,
              });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Export Analyse PDF
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              hasFullyCustomizableExpose
                ? searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
                    payload: true,
                  })
                : userDispatch({
                    type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                    payload: {
                      open: true,
                      message: subscriptionUpgradeFullyCustomizableExpose,
                    },
                  });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Export Analyse DOCX
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
                payload: true,
              });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Export Überblick PDF
          </button>
        </li>
        {hasOpenAiFeature && (
          <li>
            <button
              type="button"
              onClick={() => {
                setIsShownOpenAiLocationModal(true);
              }}
              className="btn btn-link"
            >
              <img src={pdfIcon} alt="pdf-icon" /> Lagetext generieren
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            onClick={async () => {
              try {
                await put<ApiUpdateSearchResultSnapshot>(
                  `/api/location/snapshot/${snapshotId}`,
                  {
                    config: searchContextState.responseConfig,
                    snapshot: {
                      ...snapshot,
                    },
                  }
                );
                setShowModal(true);
                toastSuccess("Erfolgreich in Zwischenablage kopiert!");
              } catch (e) {
                toastError("Fehler beim Veröffentlichen der Karte");
              }
            }}
            className="btn btn-link"
          >
            <img
              src={copyMapIcon}
              alt="copy-map-icon"
              style={{ filter: "invert(1)" }}
            />{" "}
            Karte veröffentlichen
          </button>
        </li>
      </>
    );
  };

  if (!snapshot) {
    return <div>Lade Daten...</div>;
  }

  const beforeGoBack = () => {
    const from = currentLocation.state?.from;

    if (from === "/search-result") {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: {} as ApiSearchResultSnapshotConfig,
      });
    }
  };

  return (
    <>
      <DefaultLayout
        title="Karten Editor"
        withHorizontalPadding={false}
        actionsTop={<ActionsTop />}
        actionsBottom={[
          <BackButton key="back-button" beforeGoBack={beforeGoBack} />,
        ]}
        timelineStep={3}
      >
        <TourStarter tour="editor" />
        {isShownOpenAiLocationModal && <OpenAiLocationModal />}
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
        <CodeSnippetModal
          showModal={showModal}
          setShowModal={setShowModal}
          directLink={directLink}
          codeSnippet={codeSnippet}
        />
        <div className="editor-container">
          <SearchResultContainer
            mapBoxToken={mapBoxAccessToken}
            mapBoxMapId={searchContextState.responseConfig?.mapBoxMapId}
            searchResponse={snapshot?.searchResponse!}
            placesLocation={snapshot.placesLocation}
            location={snapshot?.location}
            embedMode={true}
            editorMode={true}
            onPoiAdd={onPoiAdd}
            mapZoomLevel={mapZoomLevel}
          />
          <EditorMapMenu
            availableMeans={deriveAvailableMeansFromResponse(
              snapshot.searchResponse
            )}
            groupedEntries={editorGroups}
            config={searchContextState.responseConfig!}
            onConfigChange={(config) => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
                payload: { ...config },
              });
            }}
            snapshotId={snapshotId}
            additionalMapBoxStyles={
              userState?.user?.additionalMapBoxStyles || []
            }
          />
        </div>
      </DefaultLayout>
      {searchContextState.printingActive && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )
            .map((g) => g.items)
            .flat()}
          groupedEntries={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )}
          censusData={searchContextState.censusData!}
        />
      )}
      {searchContextState.printingDocxActive && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )
            .map((g) => g.items)
            .flat()}
          groupedEntries={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )}
          censusData={searchContextState.censusData!}
          exportType="EXPOSE_DOCX"
        />
      )}
      {searchContextState.printingCheatsheetActive && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )
            .map((g) => g.items)
            .flat()}
          groupedEntries={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )}
          censusData={searchContextState.censusData!}
          exportType="CHEATSHEET"
        />
      )}
    </>
  );
};

export default SnippetEditorPage;

import CodeSnippetModal from "components/CodeSnippetModal";
import SearchResultContainer, {
  EntityGroup
} from "components/SearchResultContainer";
import { ConfigContext } from "context/ConfigContext";
import {
  Poi,
  SearchContext,
  SearchContextActionTypes
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import EditorMapMenu from "map/menu-editor/EditorMapMenu";
import React, { useContext, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useHistory, useParams } from "react-router-dom";
import {
  buildEntityData,
  createCodeSnippet,
  createDirectLink,
  deriveAvailableMeansFromResponse,
  deriveEntityGroupsByActiveMeans,
  deriveInitialEntityGroups,
  toastError,
  toastSuccess
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import {
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  ApiUpdateSearchResultSnapshot
} from "../../../shared/types/types";
import "./SnippetEditorPage.scss";

export interface SnippetEditorRouterProps {
  snapshotId: string;
}

const SnippetEditorPage: React.FunctionComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshot>();
  const [editorGroups, setEditorGroups] = useState<EntityGroup[]>([]);
  const history = useHistory();
  const { googleApiKey, mapBoxAccessToken } = useContext(ConfigContext);
  const { userState } = useContext(UserContext);
  const { searchContextDispatch, searchContextState } = useContext(
    SearchContext
  );
  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { get, put } = useHttp();

  useEffect(() => {
    const user = userState.user;

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

      let snapshotConfig = ((snapshotResponse.config ||
        {}) as any) as ApiSearchResultSnapshotConfig;

      if (!!user?.color && !("primaryColor" in snapshotConfig)) {
        snapshotConfig["primaryColor"] = user.color;
      }

      if (!!user?.mapIcon && !("mapIcon" in snapshotConfig)) {
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
            )
      };

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...enhancedConfig }
      });

      setDirectLink(createDirectLink(snapshotResponse.token));
      setCodeSnippet(createCodeSnippet(snapshotResponse.token));
      setSnapshot(snapshotResponse.snapshot);
      if (!!snapshotResponse.snapshot && !!snapshotConfig) {
        const {
          searchResponse,
          realEstateListings,
          preferredLocations
        } = snapshotResponse.snapshot;

        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
          payload: deriveInitialEntityGroups(
            searchResponse,
            enhancedConfig,
            realEstateListings,
            preferredLocations
          )
        });
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
    if (!!snapshot) {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: deriveInitialEntityGroups(
          snapshot?.searchResponse!,
          searchContextState.responseConfig,
          snapshot.realEstateListings,
          snapshot.preferredLocations
        )
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchContextState.responseConfig?.defaultActiveGroups,
    searchContextState.responseConfig?.entityVisibility
  ]);

  const onPoiAdd = (poi: Poi) => {
    if (!!snapshot) {
      const copiedSearchResponse = JSON.parse(
        JSON.stringify(snapshot!.searchResponse)
      ) as ApiSearchResponse;
      copiedSearchResponse?.routingProfiles?.WALK?.locationsOfInterest?.push(
        (poi as any) as ApiOsmLocation
      );
      copiedSearchResponse?.routingProfiles?.BICYCLE?.locationsOfInterest?.push(
        (poi as any) as ApiOsmLocation
      );
      copiedSearchResponse?.routingProfiles?.CAR?.locationsOfInterest?.push(
        (poi as any) as ApiOsmLocation
      );

      const newEntity = buildEntityData(
        copiedSearchResponse,
        searchContextState.responseConfig
      )?.find(e => e.id === poi.entity.id)!;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: (searchContextState.responseGroupedEntities ?? []).map(ge =>
          ge.title !== poi.entity.label
            ? ge
            : {
                ...ge,
                items: [...ge.items, newEntity]
              }
        )
      });
      // update dedicated entity groups for editor
      setEditorGroups(
        editorGroups.map(ge =>
          ge.title !== poi.entity.label
            ? ge
            : { ...ge, items: [...ge.items, newEntity] }
        )
      );
    }
  };

  const ActionsTop: React.FunctionComponent = () => {
    return (
      <>
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
                      ...snapshot
                    }
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
            Karte veröffentlichen
          </button>
        </li>
      </>
    );
  };

  if (!snapshot) {
    return <div>Lade Daten...</div>;
  }

  return (
    <DefaultLayout
      title="Karten Editor"
      withHorizontalPadding={false}
      actionTop={<ActionsTop />}
      actionBottom={[<BackButton key="back-button" to="/" />]}
    >
      <TourStarter tour="editor" />
      <div className="hidden">
        <GooglePlacesAutocomplete
          apiOptions={{
            language: "de",
            region: "de"
          }}
          autocompletionRequest={{
            componentRestrictions: {
              country: ["de"]
            }
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
        />
        <EditorMapMenu
          availableMeans={deriveAvailableMeansFromResponse(
            snapshot.searchResponse
          )}
          groupedEntries={editorGroups}
          config={searchContextState.responseConfig!}
          onConfigChange={config =>
            searchContextDispatch({
              type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
              payload: { ...config }
            })
          }
          additionalMapBoxStyles={userState?.user?.additionalMapBoxStyles || []}
        />
      </div>
    </DefaultLayout>
  );
};

export default SnippetEditorPage;

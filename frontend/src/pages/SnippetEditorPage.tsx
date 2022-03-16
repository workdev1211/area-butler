import CodeSnippetModal from "components/CodeSnippetModal";
import SearchResultContainer, {
  EntityGroup
} from "components/SearchResultContainer";
import { ConfigContext } from "context/ConfigContext";
import { Poi, SearchContext } from "context/SearchContext";
import { UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import EditorMapMenu from "map/EditorMapMenu";
import React, { useContext, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useHistory, useParams } from "react-router-dom";
import {
  buildCombinedGroupedEntries,
  buildEntityData,
  buildEntityDataFromRealEstateListings,
  createCodeSnippet,
  createDirectLink,
  deriveAvailableMeansFromResponse,
  entityIncludesMean,
  toastError,
  toastSuccess
} from "shared/shared.functions";
import {
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation
} from "../../../shared/types/types";
import "./SnippetEditorPage.css";

export interface SnippetEditorRouterProps {
  snapshotId: string;
}

const SnippetEditorPage: React.FunctionComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [directLink, setDirectLink] = useState("");
  const history = useHistory();
  const { searchContextDispatch } = useContext(SearchContext);
  const { userState } = useContext(UserContext);
  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { get, put } = useHttp();
  const { googleApiKey, mapBoxAccessToken } = useContext(ConfigContext);
  const [config, setConfig] = useState<
    ApiSearchResultSnapshotConfig | undefined
  >();
  const [snapshot, setSnapshot] = useState<
    ApiSearchResultSnapshot | undefined
  >();
  const [searchResponse, setSearchResponse] = useState<
    ApiSearchResponse | undefined
  >();

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

      setConfig({
        ...snapshotConfig,
        fixedRealEstates: snapshotConfig.fixedRealEstates ?? true
      });
      setSnapshot(snapshotResponse.snapshot);
      setSearchResponse(snapshotResponse.snapshot.searchResponse);
      setDirectLink(createDirectLink(snapshotResponse.token));
      setCodeSnippet(createCodeSnippet(snapshotResponse.token));
    };

    fetchSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId]);

  const [groupedEntities, setGroupedEntities] = useState<EntityGroup[]>([]);
  const [availableMeans, setAvailableMeans] = useState<MeansOfTransportation[]>(
    []
  );
  const [activeMeans, setActiveMeans] = useState<MeansOfTransportation[]>([]);

  const updateGroupedEntities = (entities: EntityGroup[]) => {
    if (!groupedEntities.some(ge => ge.active)) {
      setGroupedEntities(
        entities.map((e, index) => (index === 0 ? { ...e, active: true } : e))
      );
    } else {
      setGroupedEntities(entities);
    }
  };

  const updateActiveMeans = (means: MeansOfTransportation[]) => {
    setActiveMeans(means);
  };

  // consume search response
  useEffect(() => {
    if (!!searchResponse) {
      const meansFromResponse = deriveAvailableMeansFromResponse(
        searchResponse
      );
      setAvailableMeans(meansFromResponse);
      updateActiveMeans(meansFromResponse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResponse, config]);

  // react to active means change
  useEffect(() => {
    let entitiesIncludedInActiveMeans =
      buildEntityData(snapshot?.searchResponse!)?.filter(entity =>
        entityIncludesMean(entity, activeMeans)
      ) ?? [];
    const centerOfSearch = searchResponse?.centerOfInterest?.coordinates!;
    if (!!snapshot?.realEstateListings) {
      entitiesIncludedInActiveMeans?.push(
        ...buildEntityDataFromRealEstateListings(
          centerOfSearch,
          snapshot?.realEstateListings
        )
      );
    }
    const theme = config?.theme;
    const defaultActive = theme !== "KF";
    updateGroupedEntities(
      buildCombinedGroupedEntries(entitiesIncludedInActiveMeans, defaultActive)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResponse, activeMeans, config]);

  const onConfigChange = (config: ApiSearchResultSnapshotConfig) => {
    setConfig(config);
  };

  const onPoiAdd = (poi: Poi) => {
    const copiedSearchResponse = JSON.parse(
      JSON.stringify(searchResponse)
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

    setSnapshot({ ...snapshot!, searchResponse: copiedSearchResponse });
    setSearchResponse({ ...copiedSearchResponse });
  };

  const ActionsTop: React.FunctionComponent = () => {
    return (
      <>
        <li>
          <button
            type="button"
            onClick={async () => {
              try {
                await put(`/api/location/snapshot/${snapshotId}`, {
                  config,
                  snapshot
                });
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
          mapBoxMapId={config?.mapBoxMapId}
          searchContextDispatch={searchContextDispatch}
          searchResponse={snapshot?.searchResponse!}
          placesLocation={snapshot.placesLocation}
          onPoiAdd={onPoiAdd}
          embedMode={true}
          initialRoutes={[]}
          initialTransitRoutes={[]}
          config={config}
          transportationParams={snapshot.transportationParams}
          location={snapshot?.location}
          preferredLocations={snapshot?.preferredLocations}
          listings={snapshot?.realEstateListings}
        />
        <EditorMapMenu
          availableMeans={availableMeans}
          groupedEntries={groupedEntities}
          config={config!}
          onConfigChange={onConfigChange}
          additionalMapBoxStyles={userState?.user?.additionalMapBoxStyles || []}
        />
      </div>
    </DefaultLayout>
  );
};

export default SnippetEditorPage;

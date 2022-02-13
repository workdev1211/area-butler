import SearchResultContainer, {
  EntityGroup,
  ResultEntity,
} from "components/SearchResultContainer";
import { ConfigContext } from "context/ConfigContext";
import { Poi, SearchContext } from "context/SearchContext";
import { useHttp } from "hooks/http";
import BackButton from "layout/BackButton";
import DefaultLayout from "layout/defaultLayout";
import EditorMapMenu from "map/EditorMapMenu";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  buildCombinedGroupedEntries,
  buildEntityData,
  deriveAvailableMeansFromResponse,
  entityIncludesMean,
  toastError,
  toastSuccess,
} from "shared/shared.functions";
import {
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
} from "../../../shared/types/types";
import Map from "../map/Map";
import "./SnippetEditorPage.css";

export interface SnippetEditorRouterProps {
  snapshotId: string;
}

const SnippetEditorPage: React.FunctionComponent = () => {
  const { searchContextDispatch } = useContext(SearchContext);
  const { snapshotId } = useParams<SnippetEditorRouterProps>();
  const { get, put } = useHttp();
  const { mapBoxAccessToken } = useContext(ConfigContext);
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
    const fetchSnapshot = async () => {
      const snapshotResponse = (
        await get<ApiSearchResultSnapshotResponse>(
          `/api/location/user-embeddable-maps/${snapshotId}`
        )
      ).data;

      setConfig(snapshotResponse.config);
      setSnapshot(snapshotResponse.snapshot);
      setSearchResponse(snapshotResponse.snapshot.searchResponse);
    };

    fetchSnapshot();
  }, [snapshotId]);

  const [entities, setEntities] = useState<ResultEntity[]>([]);
  const [groupedEntities, setGroupedEntities] = useState<EntityGroup[]>([]);
  const [availableMeans, setAvailableMeans] = useState<any>([]);
  const [activeMeans, setActiveMeans] = useState<MeansOfTransportation[]>([]);

  const updateEntities = (entities: ResultEntity[]) => {
    setEntities(entities);
  };

  const updateGroupedEntities = (entities: EntityGroup[]) => {
    if (!groupedEntities.some((ge) => ge.active)) {
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
      const meansFromResponse =
        deriveAvailableMeansFromResponse(searchResponse);
      setAvailableMeans(meansFromResponse);
      updateActiveMeans(
        config && config.defaultActiveMeans
          ? [...config.defaultActiveMeans]
          : meansFromResponse
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResponse]);

  // react to active means change
  useEffect(() => {
    let entitiesIncludedInActiveMeans =
      buildEntityData(snapshot?.searchResponse!)?.filter((entity) =>
        entityIncludesMean(entity, activeMeans)
      ) ?? [];

    updateEntities(entitiesIncludedInActiveMeans);
    const theme = config?.theme;
    const defaultActive = theme !== "KF";
    updateGroupedEntities(
      buildCombinedGroupedEntries(entitiesIncludedInActiveMeans, defaultActive)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResponse, activeMeans]);

  const onConfigChange = (config: ApiSearchResultSnapshotConfig) => {
    setConfig(config);
  };

  const onPoiAdd = (poi: Poi) => {
    const copiedSearchResponse = JSON.parse(
      JSON.stringify(searchResponse)
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
                  snapshot,
                });
                toastSuccess("Karten Snippet erfolgreich veröffentlicht!");
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
        ></SearchResultContainer>
        <EditorMapMenu
          groupedEntries={groupedEntities}
          config={config!}
          onConfigChange={onConfigChange}
        ></EditorMapMenu>
      </div>
    </DefaultLayout>
  );
};

export default SnippetEditorPage;

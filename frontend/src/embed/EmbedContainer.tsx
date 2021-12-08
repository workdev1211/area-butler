import React, { useContext, useEffect, useState } from "react";
import {
  buildCombinedGroupedEntries,
  buildEntityData,
  deriveAvailableMeansFromResponse,
  entityIncludesMean
} from "../shared/shared.functions";
import MapNavBar from "../map/MapNavBar";
import "./EmbedContainer.css";
import {
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation
} from "../../../shared/types/types";
import axios from "axios";
import Map, { defaultMapZoom } from "../map/Map";
import {
  SearchContext,
  SearchContextActionTypes
} from "../context/SearchContext";
import { EntityGroup, ResultEntity } from "../pages/SearchResultPage";
import openMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-menu.svg";
import closeMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-close.svg";
import MapMenu from "../map/MapMenu";

const EmbedContainer: React.FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );

  const [result, setResult] = useState<ApiSearchResultSnapshotResponse>();

  const [mapBoxToken, setMapBoxToken] = useState("");
  const [entities, setEntities] = useState<ResultEntity[]>([]);
  const [groupedEntities, setGroupedEntities] = useState<EntityGroup[]>([]);

  const [availableMeans, setAvailableMeans] = useState<any>([]);
  const [activeMeans, setActiveMeans] = useState<MeansOfTransportation[]>([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // fetch saved response
  useEffect(() => {
    const fetchData = async () => {
      const getQueryVariable = (variable: string) => {
        var query = window.location.search.substring(1);
        console.log(query); //"app=article&act=news_content&aid=160990"
        var vars = query.split("&");
        console.log(vars); //[ 'app=article', 'act=news_content', 'aid=160990' ]
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          console.log(pair); //[ 'app', 'article' ][ 'act', 'news_content' ][ 'aid', '160990' ]
          if (pair[0] === variable) {
            return pair[1];
          }
        }
        return false;
      };
      const baseUrl = process.env.REACT_APP_BASE_URL || "";
      const response = (
        await axios.get<ApiSearchResultSnapshotResponse>(
          `${baseUrl}/api/location/snapshot/${getQueryVariable("token")}`
        )
      ).data;
      setMapBoxToken(response.mapboxToken);
      setResult(response);
    };
    fetchData();
  }, [setMapBoxToken, searchContextDispatch, setEntities, setGroupedEntities]);

  useEffect(() => {
    if (!!result) {
      const {
        searchResponse,
        transportationParams,
        localityParams,
        location,
        placesLocation
      } = result.snapshot;
      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_RESPONSE,
        payload: searchResponse
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: transportationParams
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
        payload: localityParams
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_PLACES_LOCATION,
        payload: placesLocation
      });
      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION,
        payload: location
      });

      setAvailableMeans(deriveAvailableMeansFromResponse(searchResponse));
      setActiveMeans(deriveAvailableMeansFromResponse(searchResponse));

      let entities = buildEntityData(searchResponse)?.filter(entity =>
        entityIncludesMean(
          entity,
          deriveAvailableMeansFromResponse(searchResponse)
        )
      );
      setEntities(entities!);
      let groupedEntities = buildCombinedGroupedEntries(entities!);
      setGroupedEntities(groupedEntities!);
    }
  }, [result, searchContextDispatch]);

  useEffect(() => {
    if (Array.isArray(activeMeans) && activeMeans.length && !!result) {
      let entities = buildEntityData(
        result?.snapshot.searchResponse!
      )?.filter(entity => entityIncludesMean(entity, activeMeans));
      setEntities(entities!);
      let groupedEntities = buildCombinedGroupedEntries(entities!);
      setGroupedEntities(groupedEntities!);
    }
  }, [activeMeans, result]);

  const MapMenuMobileBtn: React.FunctionComponent = () => {
    return (
      <button
        type="button"
        className="mobile-menu-btn"
        onMouseDown={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {!mobileMenuOpen && <img src={openMenuIcon} alt="icon-menu" />}
        {mobileMenuOpen && <img src={closeMenuIcon} alt="icon-menu-close" />}
      </button>
    );
  };

  const toggleEntityGroup = (title: string) => {
    const newGroups = groupedEntities.map(ge =>
      ge.title !== title
        ? ge
        : {
            ...ge,
            active: !ge.active
          }
    );
    setGroupedEntities(newGroups);
  };

  const toggleAllEntityGroups = () => {
    const someActive = groupedEntities.some(ge => ge.active);
    const newGroups = groupedEntities.map(ge => ({
      ...ge,
      active: !someActive
    }));
    setGroupedEntities(newGroups);
  };

  const highlightZoomEntity = (item: ResultEntity) => {
    searchContextDispatch({
      type: SearchContextActionTypes.CENTER_ZOOM_COORDINATES,
      payload: { center: item.coordinates, zoom: 18 }
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_HIGHLIGHT_ID,
      payload: item.id
    });
  };

  if (!searchContextState.searchResponse) {
    return <div>Loading...</div>;
  }
  return (
    <div className="embed-container">
      <div className="relative flex-1">
        <MapNavBar
          transportationParams={searchContextState.transportationParams || []}
          activeMeans={activeMeans}
          availableMeans={availableMeans}
          onMeansChange={newValues => setActiveMeans(newValues)}
        />
        <Map
          mapBoxAccessToken={mapBoxToken}
          searchContextDispatch={searchContextDispatch}
          searchResponse={searchContextState.searchResponse}
          searchAddress={searchContextState?.placesLocation?.label}
          entities={entities}
          groupedEntities={groupedEntities}
          highlightId={searchContextState.highlightId}
          means={{
            byFoot: activeMeans.includes(MeansOfTransportation.WALK),
            byBike: activeMeans.includes(MeansOfTransportation.BICYCLE),
            byCar: activeMeans.includes(MeansOfTransportation.CAR)
          }}
          mapCenter={
            searchContextState.mapCenter ?? searchContextState.location
          }
          mapZoomLevel={searchContextState.mapZoomLevel ?? defaultMapZoom}
          printingActive={searchContextState.printingActive}
          printingCheatsheetActive={searchContextState.printingCheatsheetActive}
          routes={[]}
          transitRoutes={[]}
          embedMode={true}
        />
      </div>
      <MapMenuMobileBtn />
      <MapMenu
        mobileMenuOpen={mobileMenuOpen}
        clippings={searchContextState.mapClippings}
        groupedEntries={groupedEntities}
        toggleEntryGroup={toggleEntityGroup}
        toggleAllEntryGroups={toggleAllEntityGroups}
        highlightZoomEntity={highlightZoomEntity}
        toggleRoute={(item, mean) => null}
        routes={[]}
        toggleTransitRoute={item => null}
        transitRoutes={[]}
        searchAddress={searchContextState?.placesLocation?.label}
        resetPosition={() =>
          searchContextDispatch({
            type: SearchContextActionTypes.SET_MAP_CENTER,
            payload: searchContextState?.searchResponse?.centerOfInterest
              ?.coordinates!
          })
        }
        showInsights={false}
      />
    </div>
  );
};

export default EmbedContainer;

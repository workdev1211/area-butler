import React, { useEffect, useState } from "react";
import {
  MapClipping,
  SearchContextActions,
  SearchContextActionTypes
} from "../context/SearchContext";
import {
  EntityGroup,
  EntityRoute,
  EntityTransitRoute,
  ResultEntity
} from "../pages/SearchResultPage";
import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiUser,
  MeansOfTransportation,
  TransportationParam
} from "../../../shared/types/types";
import {
  buildCombinedGroupedEntries,
  buildEntityData,
  deriveAvailableMeansFromResponse,
  entityIncludesMean
} from "../shared/shared.functions";
import openMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-menu.svg";
import closeMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-close.svg";
import MapNavBar from "../map/MapNavBar";
import Map, { defaultMapZoom } from "../map/Map";
import MapMenu from "../map/MapMenu";
import { UserActions, UserActionTypes } from "../context/UserContext";
import { useRouting } from "../hooks/routing";
import "./SearchResultContainer.css";

export interface SearchResultContainerProps {
  mapBoxToken: string;
  searchResponse: ApiSearchResponse;
  transportationParams: TransportationParam[];
  placesLocation: any;
  location: ApiCoordinates;
  highlightId: string;
  mapZoomLevel: number;
  printingActive?: boolean;
  printingCheatsheetActive?: boolean;
  routes?: EntityRoute[];
  transitRoutes?: EntityTransitRoute[];
  censusData?: any;
  federalElectionData?: any;
  particlePollutionData?: any;
  mapClippings?: MapClipping[];
  user?: ApiUser;
  searchContextDispatch: (action: SearchContextActions) => void;
  userDispatch?: (action: UserActions) => void;
  embedMode?: boolean;
}

const SearchResultContainer: React.FunctionComponent<SearchResultContainerProps> = ({
  mapBoxToken,
  searchResponse,
  transportationParams = [],
  placesLocation,
  location,
  highlightId,
  mapZoomLevel = defaultMapZoom,
  printingActive = false,
  printingCheatsheetActive = false,
  censusData,
  federalElectionData,
  particlePollutionData,
  mapClippings = [],
  user,
  searchContextDispatch = () => null,
  userDispatch = () => null,
  embedMode = false
}) => {
  const { fetchRoutes, fetchTransitRoutes } = useRouting();

  const [entities, setEntities] = useState<ResultEntity[]>([]);
  const [groupedEntities, setGroupedEntities] = useState<EntityGroup[]>([]);
  const [availableMeans, setAvailableMeans] = useState<any>([]);
  const [activeMeans, setActiveMeans] = useState<MeansOfTransportation[]>([]);
  const [routes, setRoutes] = useState<EntityRoute[]>([]);
  const [transitRoutes, setTransitRoutes] = useState<EntityTransitRoute[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // consume search response
  useEffect(() => {
    if (!!searchResponse) {
      const meansFromResponse = deriveAvailableMeansFromResponse(
        searchResponse
      );
      setAvailableMeans(meansFromResponse);
      setActiveMeans(meansFromResponse);
    }
  }, [searchResponse, setAvailableMeans, setActiveMeans]);

  // react to active means change
  useEffect(() => {
    const entitiesIncludedInActiveMeans =
      buildEntityData(searchResponse)?.filter(entity =>
        entityIncludesMean(entity, activeMeans)
      ) ?? [];
    setEntities(entitiesIncludedInActiveMeans);
    setGroupedEntities(
      buildCombinedGroupedEntries(entitiesIncludedInActiveMeans)
    );
  }, [searchResponse, activeMeans, setEntities, setGroupedEntities]);

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

  const toggleRoutesToEntity = async (
    origin: ApiCoordinates,
    item: ResultEntity,
    mean: MeansOfTransportation
  ) => {
    const existing = routes.find(
      r =>
        r.coordinates.lat === item.coordinates.lat &&
        r.coordinates.lng === item.coordinates.lng
    );
    if (existing) {
      let newRoutes = [...existing.show];
      if (newRoutes.includes(mean)) {
        newRoutes = newRoutes.filter(r => r !== mean);
      } else {
        newRoutes.push(mean);
      }

      setRoutes(prevState => [
        ...prevState.filter(
          r =>
            r.coordinates.lat !== item.coordinates.lat &&
            r.coordinates.lng !== item.coordinates.lng
        ),
        {
          ...existing,
          show: newRoutes
        }
      ]);
    } else {
      const routesResult = await fetchRoutes({
        meansOfTransportation: [
          MeansOfTransportation.BICYCLE,
          MeansOfTransportation.CAR,
          MeansOfTransportation.WALK
        ],
        origin: origin,
        destinations: [
          {
            title: item.name || "" + item.id,
            coordinates: item.coordinates
          }
        ]
      });
      setRoutes(prev => [
        ...prev,
        {
          routes: routesResult[0].routes,
          title: routesResult[0].title,
          show: [mean],
          coordinates: item.coordinates
        }
      ]);
    }
  };

  const toggleTransitRoutesToEntity = async (
    origin: ApiCoordinates,
    item: ResultEntity
  ) => {
    const existing = transitRoutes.find(
      r =>
        r.coordinates.lat === item.coordinates.lat &&
        r.coordinates.lng === item.coordinates.lng
    );
    if (existing) {
      setTransitRoutes(prevState => [
        ...prevState.filter(
          r =>
            r.coordinates.lat !== item.coordinates.lat &&
            r.coordinates.lng !== item.coordinates.lng
        ),
        {
          ...existing,
          show: !existing.show
        }
      ]);
    } else {
      const routesResult = await fetchTransitRoutes({
        origin: origin,
        destinations: [
          {
            title: item.name || "" + item.id,
            coordinates: item.coordinates
          }
        ]
      });
      setTransitRoutes(prev => [
        ...prev,
        {
          route: routesResult[0].route,
          title: routesResult[0].title,
          show: true,
          coordinates: item.coordinates
        }
      ]);
    }
  };

  // components
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

  if (!searchResponse) {
    return <div>Loading...</div>;
  }

  return (
    <div className="search-result-container">
      <div className="relative flex-1">
        <MapNavBar
          transportationParams={transportationParams}
          activeMeans={activeMeans}
          availableMeans={availableMeans}
          onMeansChange={newValues => setActiveMeans(newValues)}
        />
        <Map
          mapBoxAccessToken={mapBoxToken}
          searchContextDispatch={searchContextDispatch}
          searchResponse={searchResponse}
          searchAddress={placesLocation?.label}
          entities={entities}
          groupedEntities={groupedEntities}
          highlightId={highlightId}
          means={{
            byFoot: activeMeans.includes(MeansOfTransportation.WALK),
            byBike: activeMeans.includes(MeansOfTransportation.BICYCLE),
            byCar: activeMeans.includes(MeansOfTransportation.CAR)
          }}
          mapCenter={location}
          mapZoomLevel={mapZoomLevel}
          printingActive={printingActive}
          printingCheatsheetActive={printingCheatsheetActive}
          routes={routes}
          transitRoutes={transitRoutes}
          embedMode={embedMode}
        />
      </div>
      <MapMenuMobileBtn />
      <MapMenu
        mobileMenuOpen={mobileMenuOpen}
        censusData={censusData}
        federalElectionData={federalElectionData}
        particlePollutionData={particlePollutionData}
        clippings={mapClippings}
        groupedEntries={groupedEntities}
        toggleEntryGroup={toggleEntityGroup}
        toggleAllEntryGroups={toggleAllEntityGroups}
        highlightZoomEntity={highlightZoomEntity}
        toggleRoute={(item, mean) => toggleRoutesToEntity(location, item, mean)}
        routes={routes}
        toggleTransitRoute={item => toggleTransitRoutesToEntity(location, item)}
        transitRoutes={transitRoutes}
        searchAddress={placesLocation?.label}
        resetPosition={() =>
          searchContextDispatch({
            type: SearchContextActionTypes.SET_MAP_CENTER,
            payload: searchResponse?.centerOfInterest?.coordinates!
          })
        }
        user={user}
        openUpgradeSubscriptionModal={message =>
          userDispatch({
            type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
            payload: { open: true, message }
          })
        }
        showInsights={!embedMode}
      />
    </div>
  );
};

export default SearchResultContainer;

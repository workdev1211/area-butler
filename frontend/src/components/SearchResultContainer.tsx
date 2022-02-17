import React, { useEffect, useState } from "react";
import {
  MapClipping,
  Poi,
  SearchContextActions,
  SearchContextActionTypes
} from "../context/SearchContext";
import {
  ApiAddress,
  ApiCoordinates,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  ApiUser,
  MeansOfTransportation,
  TransportationParam
} from "../../../shared/types/types";
import {
  buildCombinedGroupedEntries,
  buildEntityData,
  buildEntityDataFromPreferredLocations,
  buildEntityDataFromRealEstateListings,
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
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface ResultEntity {
  name?: string;
  type: string;
  label: string;
  id: string;
  coordinates: ApiCoordinates;
  address: ApiAddress;
  byFoot: boolean;
  byBike: boolean;
  byCar: boolean;
  distanceInMeters: number;
  selected?: boolean;
}

export interface EntityGroup {
  title: string;
  active: boolean;
  items: ResultEntity[];
}

export interface SearchResultContainerProps {
  mapBoxToken: string;
  mapBoxMapId?: string;
  searchResponse: ApiSearchResponse;
  transportationParams: TransportationParam[];
  placesLocation: any;
  location: ApiCoordinates;
  highlightId?: string;
  mapZoomLevel?: number;
  censusData?: any;
  federalElectionData?: any;
  particlePollutionData?: any;
  mapClippings?: MapClipping[];
  user?: ApiUser;
  preferredLocations?: ApiPreferredLocation[];
  listings?: ApiRealEstateListing[];
  searchContextDispatch: (action: SearchContextActions) => void;
  userDispatch?: (action: UserActions) => void;
  onEntitiesChange?: (entities: ResultEntity[]) => void;
  onGroupedEntitiesChange?: (entities: EntityGroup[]) => void;
  onActiveMeansChange?: (activeMeans: MeansOfTransportation[]) => void;
  embedMode?: boolean;
  config?: ApiSearchResultSnapshotConfig;
  initialRoutes?: EntityRoute[];
  initialTransitRoutes?: EntityTransitRoute[];
  onPoiAdd?: (poi: Poi) => void;
}

const SearchResultContainer: React.FunctionComponent<SearchResultContainerProps> = ({
  mapBoxToken,
  mapBoxMapId,
  searchResponse,
  transportationParams = [],
  placesLocation,
  location,
  highlightId = "",
  mapZoomLevel = defaultMapZoom,
  censusData,
  federalElectionData,
  particlePollutionData,
  mapClippings = [],
  user,
  preferredLocations,
  listings,
  searchContextDispatch = () => null,
  userDispatch = () => null,
  onActiveMeansChange = () => null,
  onEntitiesChange = () => null,
  onGroupedEntitiesChange = () => null,
  embedMode = false,
  config,
  initialRoutes = [],
  initialTransitRoutes = [],
  onPoiAdd
}) => {
  const { fetchRoutes, fetchTransitRoutes } = useRouting();

  const [entities, setEntities] = useState<ResultEntity[]>([]);
  const [groupedEntities, setGroupedEntities] = useState<EntityGroup[]>([]);
  const [availableMeans, setAvailableMeans] = useState<any>([]);
  const [activeMeans, setActiveMeans] = useState<MeansOfTransportation[]>([]);
  const [routes, setRoutes] = useState<EntityRoute[]>(initialRoutes);
  const [transitRoutes, setTransitRoutes] = useState<EntityTransitRoute[]>(
    initialTransitRoutes
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const updateEntities = (entities: ResultEntity[]) => {
    setEntities(entities);
    onEntitiesChange(entities);
  };

  const updateGroupedEntities = (entities: EntityGroup[]) => {
    if (!groupedEntities.some(ge => ge.active)) {
      setGroupedEntities(
        entities.map((e, index) => (index === 0 ? { ...e, active: true } : e))
      );
    } else {
      setGroupedEntities(entities);
    }
    onGroupedEntitiesChange(entities);
  };

  const updateActiveMeans = (means: MeansOfTransportation[]) => {
    setActiveMeans(means);
    onActiveMeansChange(means);
  };

  // consume search response
  useEffect(() => {
    if (!!searchResponse) {
      const meansFromResponse = deriveAvailableMeansFromResponse(
        searchResponse
      );
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
      buildEntityData(searchResponse, config)?.filter(entity =>
        entityIncludesMean(entity, activeMeans)
      ) ?? [];
    const centerOfSearch = searchResponse?.centerOfInterest?.coordinates;
    if (!!preferredLocations) {
      entitiesIncludedInActiveMeans?.push(
        ...buildEntityDataFromPreferredLocations(
          centerOfSearch,
          preferredLocations
        )
      );
    }
    if (!!listings) {
      entitiesIncludedInActiveMeans?.push(
        ...buildEntityDataFromRealEstateListings(centerOfSearch, listings)
      );
    }
    updateEntities(entitiesIncludedInActiveMeans);
    const oldActiveEntityGroups = groupedEntities
      .filter(ge => ge.active)
      .map(ge => ge.title);
    const theme = config?.theme;
    const defaultActive = theme !== "KF";
    updateGroupedEntities(
      buildCombinedGroupedEntries(
        entitiesIncludedInActiveMeans,
        defaultActive,
        oldActiveEntityGroups
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResponse, config, activeMeans, preferredLocations, listings]);

  const toggleEntityGroup = (title: string) => {
    const theme = config?.theme;
    let newGroups: EntityGroup[] = [];
    switch (theme) {
      case "KF":
        newGroups = groupedEntities.map(ge => ({
          ...ge,
          active: ge.title === title
        }));
        break;
      default:
        newGroups = groupedEntities.map(ge =>
          ge.title !== title
            ? ge
            : {
                ...ge,
                active: !ge.active
              }
        );
    }
    updateGroupedEntities(newGroups);
  };

  const toggleAllEntityGroups = () => {
    const someActive = groupedEntities.some(ge => ge.active);
    const newGroups = groupedEntities.map(ge => ({
      ...ge,
      active: !someActive
    }));
    updateGroupedEntities(newGroups);
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
      if (routesResult.length) {
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

  const containerClasses = `search-result-container theme-${config?.theme}`;

  return (
    <>
      <div className={containerClasses}>
        <div className="relative flex-1">
          <MapNavBar
            transportationParams={transportationParams}
            activeMeans={activeMeans}
            availableMeans={availableMeans}
            onMeansChange={newValues => setActiveMeans(newValues)}
          />
          <Map
            mapBoxAccessToken={mapBoxToken}
            mapboxMapId={mapBoxMapId}
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
            routes={routes}
            transitRoutes={transitRoutes}
            embedMode={embedMode}
            config={config}
            onPoiAdd={onPoiAdd}
          />
        </div>
        {config?.theme !== "KF" && <MapMenuMobileBtn />}
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
          toggleRoute={(item, mean) =>
            toggleRoutesToEntity(location, item, mean)
          }
          routes={routes}
          toggleTransitRoute={item =>
            toggleTransitRoutesToEntity(location, item)
          }
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
          config={config}
        />
      </div>
    </>
  );
};

export default SearchResultContainer;

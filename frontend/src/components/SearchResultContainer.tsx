import React, { useContext, useEffect, useState } from "react";
import {
  Poi,
  SearchContext,
  SearchContextActionTypes
} from "../context/SearchContext";
import {
  ApiAddress,
  ApiCoordinates,
  ApiSearchResponse,
  ApiUser,
  MeansOfTransportation
} from "../../../shared/types/types";
import {
  deriveAvailableMeansFromResponse,
  deriveEntityGroupsByActiveMeans,
  toggleEntityVisibility
} from "../shared/shared.functions";
import openMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-menu.svg";
import closeMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-close.svg";
import Map, { defaultMapZoom } from "../map/Map";
import { UserActions, UserActionTypes } from "../context/UserContext";
import { useRouting } from "../hooks/routing";
import "./SearchResultContainer.scss";
import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost
} from "../../../shared/types/real-estate";
import MeansToggle from "../map/means-toggle/MeansToggle";
import MapMenu from "../map/menu/MapMenu";

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
  realEstateData?: {
    costStructure?: ApiRealEstateCost;
    characteristics?: ApiRealEstateCharacteristics;
  };
  selected?: boolean;
  externalUrl?: string;
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
  placesLocation: any;
  location: ApiCoordinates;
  mapZoomLevel?: number;
  user?: ApiUser;
  userDispatch?: (action: UserActions) => void;
  embedMode?: boolean;
  editorMode?: boolean;
  onPoiAdd?: (poi: Poi) => void;
}

const SearchResultContainer: React.FunctionComponent<SearchResultContainerProps> = ({
  mapBoxToken,
  mapBoxMapId,
  searchResponse,
  placesLocation,
  location,
  mapZoomLevel = defaultMapZoom,
  user,
  userDispatch = () => null,
  embedMode = false,
  editorMode = false,
  onPoiAdd
}) => {
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );
  const { fetchRoutes, fetchTransitRoutes } = useRouting();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [availableMeans, setAvailableMeans] = useState<any>([]);
  const [filteredGroupedEntities, setFilteredGroupedEntities] = useState<
    EntityGroup[]
  >([]);

  const [hideIsochrones, setHideIsochrones] = useState(
    searchContextState.responseConfig?.hideIsochrones
  );

  useEffect(() => {
    setHideIsochrones(searchContextState.responseConfig?.hideIsochrones);
  }, [searchContextState.responseConfig?.hideIsochrones, setHideIsochrones]);

  // Customize primary color
  useEffect(() => {
    if (!!searchContextState.responseConfig?.primaryColor) {
      const r = document.getElementById("search-result-container");
      r?.style.setProperty(
        "--primary",
        searchContextState.responseConfig.primaryColor
      );
      r?.style.setProperty(
        "--custom-primary",
        searchContextState.responseConfig.primaryColor
      );
    } else {
      const r = document.getElementById("search-result-container");
      r?.style.setProperty("--primary", "#c91444");
      r?.style.setProperty("--custom-primary", "#c91444");
    }
  }, [searchContextState.responseConfig]);

  // consume search response and set active/available means
  useEffect(() => {
    if (!!searchResponse) {
      const meansFromResponse = deriveAvailableMeansFromResponse(
        searchResponse
      );
      setAvailableMeans(meansFromResponse);

      const activeMeans =
        searchContextState.responseConfig &&
        searchContextState.responseConfig.defaultActiveMeans
          ? [...searchContextState.responseConfig.defaultActiveMeans]
          : meansFromResponse;
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS,
        payload: [...activeMeans]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResponse, searchContextState.responseConfig]);

  // react to active means change
  useEffect(() => {
    const groupsFilteredByActiveMeans = deriveEntityGroupsByActiveMeans(
      searchContextState.responseGroupedEntities,
      searchContextState.responseActiveMeans
    );
    setFilteredGroupedEntities(groupsFilteredByActiveMeans);
  }, [
    searchContextState.responseGroupedEntities,
    searchContextState.responseActiveMeans,
    setFilteredGroupedEntities
  ]);

  const toggleRoutesToEntity = async (
    origin: ApiCoordinates,
    item: ResultEntity,
    mean: MeansOfTransportation
  ) => {
    const existing = searchContextState.responseRoutes.find(
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

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
        payload: [
          ...searchContextState.responseRoutes.filter(
            r =>
              r.coordinates.lat !== item.coordinates.lat &&
              r.coordinates.lng !== item.coordinates.lng
          ),
          {
            ...existing,
            show: newRoutes
          }
        ]
      });
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
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
        payload: [
          ...searchContextState.responseRoutes,
          {
            routes: routesResult[0].routes,
            title: routesResult[0].title,
            show: [mean],
            coordinates: item.coordinates
          }
        ]
      });
    }
  };

  const toggleTransitRoutesToEntity = async (
    origin: ApiCoordinates,
    item: ResultEntity
  ) => {
    const existing = searchContextState.responseTransitRoutes.find(
      r =>
        r.coordinates.lat === item.coordinates.lat &&
        r.coordinates.lng === item.coordinates.lng
    );
    if (existing) {
      const newTransitRoutes = [
        ...searchContextState.responseTransitRoutes.filter(
          r =>
            r.coordinates.lat !== item.coordinates.lat &&
            r.coordinates.lng !== item.coordinates.lng
        ),
        {
          ...existing,
          show: !existing.show
        }
      ];
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES,
        payload: newTransitRoutes
      });
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
        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES,
          payload: [
            ...searchContextState.responseTransitRoutes,
            {
              route: routesResult[0].route,
              title: routesResult[0].title,
              show: true,
              coordinates: item.coordinates
            }
          ]
        });
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
    return <div>Laden...</div>;
  }

  const hideEntity = (item: ResultEntity) => {
    if (searchContextState.responseConfig) {
      const newEntityVisibility = toggleEntityVisibility(
        item,
        searchContextState.responseConfig
      );
      const newConfig = {
        ...searchContextState.responseConfig,
        entityVisibility: [...newEntityVisibility]
      };
      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...newConfig }
      });
    }
  };

  const containerClasses = `search-result-container theme-${searchContextState.responseConfig?.theme}`;
  const mapWithLegendId = "map-with-legend";

  return (
    <>
      <div className={containerClasses} id="search-result-container">
        <div className="relative flex-1" id={mapWithLegendId}>
          <MeansToggle
            transportationParams={searchContextState.transportationParams}
            activeMeans={searchContextState.responseActiveMeans}
            availableMeans={availableMeans}
            onMeansChange={(newValues: MeansOfTransportation[]) =>
              searchContextDispatch({
                type: SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS,
                payload: [...newValues]
              })
            }
            hideIsochrones={!!hideIsochrones}
          />
          <Map
            mapBoxAccessToken={mapBoxToken}
            mapboxMapId={mapBoxMapId}
            searchResponse={searchResponse}
            searchAddress={placesLocation?.label}
            groupedEntities={filteredGroupedEntities ?? []}
            highlightId={searchContextState.highlightId}
            snippetToken={searchContextState.responseToken}
            setHighlightId={id =>
              searchContextDispatch({
                type: SearchContextActionTypes.SET_HIGHLIGHT_ID,
                payload: id
              })
            }
            means={{
              byFoot: searchContextState.responseActiveMeans.includes(
                MeansOfTransportation.WALK
              ),
              byBike: searchContextState.responseActiveMeans.includes(
                MeansOfTransportation.BICYCLE
              ),
              byCar: searchContextState.responseActiveMeans.includes(
                MeansOfTransportation.CAR
              )
            }}
            mapCenter={location}
            mapZoomLevel={mapZoomLevel}
            routes={searchContextState.responseRoutes}
            transitRoutes={searchContextState.responseTransitRoutes}
            embedMode={embedMode}
            editorMode={editorMode}
            config={searchContextState.responseConfig}
            onPoiAdd={onPoiAdd}
            hideEntity={hideEntity}
            centerZoomCoordinates={(zoom, coordinates) =>
              searchContextDispatch({
                type: SearchContextActionTypes.CENTER_ZOOM_COORDINATES,
                payload: {
                  center: {
                    ...coordinates
                  },
                  zoom
                }
              })
            }
            addMapClipping={(zoomLevel, mapClippingDataUrl) =>
              searchContextDispatch({
                type: SearchContextActionTypes.ADD_MAP_CLIPPING,
                payload: {
                  zoomLevel,
                  mapClippingDataUrl
                }
              })
            }
            hideIsochrones={!!hideIsochrones}
            setHideIsochrones={setHideIsochrones}
            mapWithLegendId={mapWithLegendId}
          />
        </div>
        {searchContextState.responseConfig?.theme !== "KF" && (
          <MapMenuMobileBtn />
        )}
        <MapMenu
          mobileMenuOpen={mobileMenuOpen}
          censusData={searchContextState.censusData}
          federalElectionData={searchContextState.federalElectionData}
          particlePollutionData={searchContextState.particlePollutionData}
          clippings={searchContextState.mapClippings}
          groupedEntries={filteredGroupedEntities ?? []}
          toggleAllLocalities={() => {
            const oldGroupedEntities =
              searchContextState.responseGroupedEntities ?? [];
            searchContextDispatch({
              type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
              payload: oldGroupedEntities.map(g => ({
                ...g,
                active: !oldGroupedEntities.some(g => g.active)
              }))
            });
          }}
          toggleRoute={(item, mean) =>
            toggleRoutesToEntity(location, item, mean)
          }
          routes={searchContextState.responseRoutes}
          toggleTransitRoute={item =>
            toggleTransitRoutesToEntity(location, item)
          }
          transitRoutes={searchContextState.responseTransitRoutes}
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
          config={searchContextState.responseConfig}
        />
      </div>
    </>
  );
};

export default SearchResultContainer;

import {
  forwardRef,
  FunctionComponent,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  IGotoMapCenter,
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import {
  ApiAddress,
  ApiCoordinates,
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  ApiUser,
  IApiUserPoiIcons,
  MapDisplayModesEnum,
  MeansOfTransportation,
  OsmName,
} from "../../../shared/types/types";
import {
  deriveAvailableMeansFromResponse,
  deriveEntityGroupsByActiveMeans,
  preferredLocationsTitle,
  realEstateListingsTitle,
  toggleEntityVisibility,
} from "../shared/shared.functions";
import openMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-menu.svg";
import closeMenuIcon from "../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import Map from "../map/Map";
import { UserActions, UserActionTypes } from "../context/UserContext";
import { useRouting } from "../hooks/routing";
import "./SearchResultContainer.scss";
import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
} from "../../../shared/types/real-estate";
import MeansToggle from "../map/means-toggle/MeansToggle";
import MapMenu from "../map/menu/MapMenu";
import { defaultColor } from "../../../shared/constants/constants";
import PreferredLocationsModal from "../map/menu/karla-fricke/PreferredLocationsModal";
import {
  defaultMapboxStyles,
  defaultMapZoom,
  MapboxStyleLabelsEnum,
} from "../shared/shared.constants";
import MapMenuKarlaFricke from "../map/menu/karla-fricke/MapMenuKarlaFricke";
import { TUnlockIntProduct } from "../../../shared/types/integration";

export interface ICurrentMapRef {
  getZoom: () => number | undefined;
  getCenter: () => ApiCoordinates | undefined;
  handleScrollWheelZoom: {
    isScrollWheelZoomEnabled: () => boolean;
    enableScrollWheelZoom: () => void;
    disableScrollWheelZoom: () => void;
  };
  handleDragging: {
    isDraggingEnabled: () => boolean;
    enableDragging: () => void;
    disableDragging: () => void;
  };
}

export interface ResultEntity {
  name?: string;
  osmName: OsmName;
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

export const poiSearchContainerId = "poi-search-container";

export interface IEditorTabProps {
  availableMeans: MeansOfTransportation[];
  groupedEntries: EntityGroup[];
  config: ApiSearchResultSnapshotConfig;
  onConfigChange: (config: ApiSearchResultSnapshotConfig) => void;
  snapshotId: string;
  additionalMapBoxStyles?: { key: string; label: string }[];
  isNewSnapshot: boolean;
}

export interface IExportTabProps {
  codeSnippet: string;
  directLink: string;
  searchAddress: string;
  snapshotId: string;
  performUnlock?: TUnlockIntProduct;
}

interface ISearchResultContainerProps {
  mapBoxToken: string;
  mapBoxMapId?: string;
  searchResponse: ApiSearchResponse;
  searchAddress: string;
  location: ApiCoordinates;
  mapDisplayMode: MapDisplayModesEnum;
  saveConfig?: () => Promise<void>;
  mapZoomLevel?: number;
  user?: ApiUser;
  userDispatch?: (action: UserActions) => void; // we need it because Embed module doesn't have the user context
  onPoiAdd?: (poi: ApiOsmLocation) => void;
  isTrial: boolean;
  userPoiIcons?: IApiUserPoiIcons;
  editorTabProps?: IEditorTabProps;
  exportTabProps?: IExportTabProps;
}

const SearchResultContainer = forwardRef<
  ICurrentMapRef,
  ISearchResultContainerProps
>(
  (
    {
      mapBoxToken,
      mapBoxMapId,
      searchResponse,
      searchAddress,
      location,
      mapDisplayMode,
      saveConfig,
      mapZoomLevel,
      user,
      userDispatch = () => null,
      onPoiAdd,
      isTrial,
      userPoiIcons = user?.poiIcons,
      editorTabProps,
      exportTabProps,
    },
    parentMapRef
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const mapRef = useRef<ICurrentMapRef | null>(null);
    useImperativeHandle(parentMapRef, () => ({
      getZoom: () => mapRef.current?.getZoom(),
      getCenter: () => mapRef.current?.getCenter(),
      handleScrollWheelZoom: {
        isScrollWheelZoomEnabled: () =>
          !!mapRef.current?.handleScrollWheelZoom.isScrollWheelZoomEnabled(),
        enableScrollWheelZoom: () => {
          mapRef.current?.handleScrollWheelZoom.enableScrollWheelZoom();
        },
        disableScrollWheelZoom: () => {
          mapRef.current?.handleScrollWheelZoom.disableScrollWheelZoom();
        },
      },
      handleDragging: {
        isDraggingEnabled: () =>
          !!mapRef.current?.handleDragging.isDraggingEnabled(),
        enableDragging: () => mapRef.current?.handleDragging.enableDragging(),
        disableDragging: () => mapRef.current?.handleDragging.disableDragging(),
      },
    }));

    const { searchContextState, searchContextDispatch } =
      useContext(SearchContext);

    const { fetchRoutes, fetchTransitRoutes } = useRouting();

    const initialMapBoxMapIds = {
      current:
        mapBoxMapId ||
        defaultMapboxStyles.find(
          ({ label }) => label === MapboxStyleLabelsEnum.CLASSIC
        )?.key,
      previous: defaultMapboxStyles.find(
        ({ label }) => label === MapboxStyleLabelsEnum.SATELLITE
      )?.key,
    };

    const isThemeKf = searchContextState.responseConfig?.theme === "KF";
    const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

    const isEmbeddedMode = [
      MapDisplayModesEnum.EMBED,
      MapDisplayModesEnum.EMBED_INTEGRATION,
    ].includes(mapDisplayMode);

    const isMapMenuShown =
      !isEmbeddedMode ||
      (searchContextState.responseConfig?.hideMapMenu
        ? false
        : isEmbeddedMode && !isThemeKf);

    const isMapMenuKarlaFrickeShown =
      isThemeKf &&
      (!isEmbeddedMode || !searchContextState.responseConfig?.hideMapMenu);

    const isMeanTogglesShown =
      !isEmbeddedMode || !searchContextState.responseConfig?.hideMeanToggles;

    const [isMapMenuOpen, setIsMapMenuOpen] = useState(isMapMenuShown);
    const [availableMeans, setAvailableMeans] = useState<
      MeansOfTransportation[]
    >([]);
    const [resultingGroupedEntities, setResultingGroupedEntities] = useState<
      EntityGroup[]
    >([]);
    const [hideIsochrones, setHideIsochrones] = useState(
      searchContextState.responseConfig?.hideIsochrones
    );
    const [mapBoxMapIds, setMapBoxMapIds] = useState(initialMapBoxMapIds);
    const [preferredLocationsGroup, setPreferredLocationsGroup] =
      useState<EntityGroup>();
    const [isShownPreferredLocationsModal, setIsShownPreferredLocationsModal] =
      useState(false);

    useEffect(() => {
      if (
        containerRef.current?.offsetWidth &&
        containerRef.current?.offsetWidth < 769
      ) {
        setIsMapMenuOpen(false);
      }
    }, [containerRef]);

    useEffect(() => {
      setMapBoxMapIds(initialMapBoxMapIds);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapBoxMapId]);

    useEffect(() => {
      setHideIsochrones(searchContextState.responseConfig?.hideIsochrones);
    }, [searchContextState.responseConfig?.hideIsochrones, setHideIsochrones]);

    // Customize primary color
    useEffect(() => {
      const primaryColor =
        searchContextState.responseConfig?.primaryColor || defaultColor;

      const r = document.getElementById("search-result-container");
      r?.style.setProperty("--primary", primaryColor);
      r?.style.setProperty("--custom-primary", primaryColor);
    }, [searchContextState.responseConfig?.primaryColor]);

    // consume search response and set active/available means
    useEffect(() => {
      if (!searchResponse) {
        return;
      }

      const meansFromResponse =
        deriveAvailableMeansFromResponse(searchResponse);

      setAvailableMeans(meansFromResponse);

      const activeMeans =
        searchContextState.responseConfig &&
        searchContextState.responseConfig.defaultActiveMeans
          ? [...searchContextState.responseConfig.defaultActiveMeans]
          : meansFromResponse;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS,
        payload: [...activeMeans],
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchResponse, searchContextState.responseConfig?.defaultActiveMeans]);

    // react to active means change (changes in POIs)
    useEffect(() => {
      setPreferredLocationsGroup(undefined);

      const groupsFilteredByActiveMeans = deriveEntityGroupsByActiveMeans(
        searchContextState.responseGroupedEntities,
        searchContextState.responseActiveMeans
      );

      const foundPreferredLocationsGroup = groupsFilteredByActiveMeans.find(
        (group) => {
          return group.items[0]?.label === preferredLocationsTitle;
        }
      );

      setPreferredLocationsGroup(foundPreferredLocationsGroup);
      setResultingGroupedEntities(groupsFilteredByActiveMeans);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      searchContextState.responseGroupedEntities,
      searchContextState.responseActiveMeans,
    ]);

    const toggleRoutesToEntity = async (
      origin: ApiCoordinates,
      item: ResultEntity,
      mean: MeansOfTransportation
    ): Promise<void> => {
      const existing = searchContextState.responseRoutes.find(
        (r) =>
          r.coordinates.lat === item.coordinates.lat &&
          r.coordinates.lng === item.coordinates.lng
      );

      if (existing) {
        let newRoutes = [...existing.show];

        if (newRoutes.includes(mean)) {
          newRoutes = newRoutes.filter((r) => r !== mean);
        } else {
          newRoutes.push(mean);
        }

        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
          payload: [
            ...searchContextState.responseRoutes.filter(
              (r) =>
                r.coordinates.lat !== item.coordinates.lat &&
                r.coordinates.lng !== item.coordinates.lng
            ),
            {
              ...existing,
              show: newRoutes,
            },
          ],
        });

        return;
      }

      const routesResult = await fetchRoutes({
        snapshotToken: searchContextState.responseToken,
        userEmail: user?.email!,
        meansOfTransportation: [
          MeansOfTransportation.BICYCLE,
          MeansOfTransportation.CAR,
          MeansOfTransportation.WALK,
        ],
        origin: origin,
        destinations: [
          {
            title: item.name || "" + item.id,
            coordinates: item.coordinates,
          },
        ],
      });

      if (routesResult.length) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
          payload: [
            ...searchContextState.responseRoutes,
            {
              routes: routesResult[0].routes,
              title: routesResult[0].title,
              show: [mean],
              coordinates: item.coordinates,
            },
          ],
        });
      }
    };

    const toggleTransitRoutesToEntity = async (
      origin: ApiCoordinates,
      item: ResultEntity
    ): Promise<void> => {
      const existing = searchContextState.responseTransitRoutes.find(
        (r) =>
          r.coordinates.lat === item.coordinates.lat &&
          r.coordinates.lng === item.coordinates.lng
      );

      if (existing) {
        const newTransitRoutes = [
          ...searchContextState.responseTransitRoutes.filter(
            (r) =>
              r.coordinates.lat !== item.coordinates.lat &&
              r.coordinates.lng !== item.coordinates.lng
          ),
          {
            ...existing,
            show: !existing.show,
          },
        ];

        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES,
          payload: newTransitRoutes,
        });

        return;
      }

      const routesResult = await fetchTransitRoutes({
        snapshotToken: searchContextState.responseToken,
        userEmail: user?.email!,
        origin: origin,
        destinations: [
          {
            title: item.name || `${item.id}`,
            coordinates: item.coordinates,
          },
        ],
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
              coordinates: item.coordinates,
            },
          ],
        });
      }
    };

    const ShowMapMenuButton: FunctionComponent = () => {
      return (
        <button
          type="button"
          className={`show-map-menu-btn ${!isEditorMode ? "embed-mode" : ""}`}
          data-tour="ShowMapMenuButton"
          onMouseDown={() => {
            setIsMapMenuOpen(!isMapMenuOpen);
          }}
        >
          {!isMapMenuOpen && <img src={openMenuIcon} alt="icon-menu" />}
          {isMapMenuOpen && (
            <img
              src={closeMenuIcon}
              alt="icon-menu-close"
              style={{
                transform: "rotate(270deg)",
              }}
            />
          )}
        </button>
      );
    };

    if (!searchResponse) {
      return <div>Laden...</div>;
    }

    const hideEntity = (item: ResultEntity): void => {
      if (!searchContextState.responseConfig) {
        return;
      }

      const newEntityVisibility = toggleEntityVisibility(
        item,
        searchContextState.responseConfig
      );

      const newConfig = {
        ...searchContextState.responseConfig,
        entityVisibility: [...newEntityVisibility],
      };

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...newConfig },
      });
    };

    const toggleSatelliteMapMode = () => {
      setMapBoxMapIds({
        current: mapBoxMapIds.previous,
        previous: mapBoxMapIds.current,
      });
    };

    const toggleAllLocalities = () => {
      const oldGroupedEntities =
        searchContextState.responseGroupedEntities ?? [];

      if (!oldGroupedEntities.length) {
        return;
      }

      let responseGroupedEntities: EntityGroup[];
      const isToggled = oldGroupedEntities.some(({ active }) => active);

      switch (searchContextState.responseConfig?.theme) {
        case "KF": {
          if (isToggled) {
            responseGroupedEntities = oldGroupedEntities.map((entityGroup) => ({
              ...entityGroup,
              active: false,
            }));
            break;
          }

          const hasMainKfCategories = oldGroupedEntities.some(({ title }) =>
            [preferredLocationsTitle, realEstateListingsTitle].includes(title)
          );

          if (!hasMainKfCategories) {
            responseGroupedEntities = [...oldGroupedEntities];
            responseGroupedEntities[0].active = true;
            break;
          }

          responseGroupedEntities = oldGroupedEntities.map((entityGroup) => ({
            ...entityGroup,
            active: [preferredLocationsTitle, realEstateListingsTitle].includes(
              entityGroup.title
            ),
          }));
          break;
        }

        default: {
          responseGroupedEntities = oldGroupedEntities.map((entityGroup) => ({
            ...entityGroup,
            active: !isToggled,
          }));
        }
      }

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
        payload: responseGroupedEntities,
      });
    };

    const containerClasses = `search-result-container theme-${searchContextState.responseConfig?.theme}`;
    const mapWithLegendId = "map-with-legend";

    if (!mapBoxToken) {
      return null;
    }

    return (
      <>
        <div
          id="search-result-container"
          className={containerClasses}
          ref={containerRef}
        >
          <div className="relative flex-1" id={mapWithLegendId}>
            <div
              className={`map-nav-bar-container ${
                isMapMenuOpen ? "map-menu-open" : ""
              }`}
            >
              {isMeanTogglesShown && (
                <MeansToggle
                  transportationParams={searchContextState.transportationParams}
                  activeMeans={searchContextState.responseActiveMeans}
                  availableMeans={availableMeans}
                  onMeansChange={(newValues: MeansOfTransportation[]) => {
                    searchContextDispatch({
                      type: SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS,
                      payload: [...newValues],
                    });
                  }}
                  hideIsochrones={!!hideIsochrones}
                />
              )}
            </div>
            <Map
              mapBoxAccessToken={mapBoxToken}
              mapboxMapId={mapBoxMapIds.current}
              searchResponse={searchResponse}
              searchAddress={searchAddress}
              groupedEntities={resultingGroupedEntities ?? []}
              snippetToken={searchContextState.responseToken}
              means={{
                byFoot: searchContextState.responseActiveMeans.includes(
                  MeansOfTransportation.WALK
                ),
                byBike: searchContextState.responseActiveMeans.includes(
                  MeansOfTransportation.BICYCLE
                ),
                byCar: searchContextState.responseActiveMeans.includes(
                  MeansOfTransportation.CAR
                ),
              }}
              mapCenter={
                searchContextState.mapCenter ||
                searchResponse.centerOfInterest.coordinates
              }
              mapZoomLevel={
                mapZoomLevel ||
                searchContextState.mapZoomLevel ||
                defaultMapZoom
              }
              highlightId={searchContextState.highlightId}
              setHighlightId={(highlightId) =>
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_HIGHLIGHT_ID,
                  payload: highlightId,
                })
              }
              routes={searchContextState.responseRoutes}
              transitRoutes={searchContextState.responseTransitRoutes}
              mapDisplayMode={mapDisplayMode}
              config={searchContextState.responseConfig}
              onPoiAdd={onPoiAdd}
              hideEntity={hideEntity}
              setMapCenterZoom={(mapCenter, mapZoomLevel) => {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_MAP_CENTER_ZOOM,
                  payload: {
                    mapCenter: {
                      ...mapCenter,
                    },
                    mapZoomLevel,
                  },
                });
              }}
              addMapClipping={(zoomLevel, mapClippingDataUrl) => {
                searchContextDispatch({
                  type: SearchContextActionTypes.ADD_MAP_CLIPPING,
                  payload: {
                    zoomLevel,
                    mapClippingDataUrl,
                  },
                });
              }}
              hideIsochrones={!!hideIsochrones} // don't remove the !! operators
              setHideIsochrones={setHideIsochrones}
              mapWithLegendId={mapWithLegendId}
              toggleSatelliteMapMode={toggleSatelliteMapMode}
              isShownPreferredLocationsModal={isShownPreferredLocationsModal}
              togglePreferredLocationsModal={setIsShownPreferredLocationsModal}
              gotoMapCenter={searchContextState.gotoMapCenter}
              setGotoMapCenter={(data: IGotoMapCenter | undefined) => {
                searchContextDispatch({
                  type: SearchContextActionTypes.GOTO_MAP_CENTER,
                  payload: data,
                });
              }}
              isTrial={isTrial}
              userMapPoiIcons={userPoiIcons?.mapPoiIcons}
              ref={mapRef}
            />
          </div>
          {isMapMenuShown && <ShowMapMenuButton />}
          {isMapMenuKarlaFrickeShown && (
            <MapMenuKarlaFricke
              groupedEntries={(resultingGroupedEntities ?? [])
                .filter(
                  (ge) =>
                    ge.items.length && ge.title !== realEstateListingsTitle
                )
                .sort((a, b) => (a.title > b.title ? 1 : -1))}
              isMapMenuOpen={isMapMenuOpen}
              isShownPreferredLocationsModal={isShownPreferredLocationsModal}
              togglePreferredLocationsModal={setIsShownPreferredLocationsModal}
              userMenuPoiIcons={userPoiIcons?.menuPoiIcons}
            />
          )}
          {isMapMenuShown && (
            <MapMenu
              isMapMenuOpen={isMapMenuOpen}
              censusData={searchContextState.censusData}
              federalElectionData={searchContextState.federalElectionData}
              particlePollutionData={searchContextState.particlePollutionData}
              locationIndexData={searchContextState.locationIndexData}
              groupedEntries={resultingGroupedEntities ?? []}
              toggleAllLocalities={toggleAllLocalities}
              toggleRoute={(item, mean) =>
                toggleRoutesToEntity(location, item, mean)
              }
              routes={searchContextState.responseRoutes}
              toggleTransitRoute={(item) =>
                toggleTransitRoutesToEntity(location, item)
              }
              transitRoutes={searchContextState.responseTransitRoutes}
              searchAddress={searchAddress}
              resetPosition={() => {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_MAP_CENTER,
                  payload: searchResponse?.centerOfInterest?.coordinates!,
                });

                searchContextDispatch({
                  type: SearchContextActionTypes.GOTO_MAP_CENTER,
                  payload: { goto: true },
                });
              }}
              saveConfig={saveConfig}
              userMenuPoiIcons={userPoiIcons?.menuPoiIcons}
              openUpgradeSubscriptionModal={(message) => {
                userDispatch({
                  type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                  payload: { open: true, message },
                });
              }}
              showInsights={isEditorMode}
              config={searchContextState.responseConfig}
              mapDisplayMode={mapDisplayMode}
              editorTabProps={editorTabProps}
              exportTabProps={exportTabProps}
            />
          )}
          {isThemeKf &&
            preferredLocationsGroup &&
            isShownPreferredLocationsModal && (
              <PreferredLocationsModal
                entityGroup={preferredLocationsGroup}
                routes={searchContextState.responseRoutes}
                toggleRoute={(item, mean) =>
                  toggleRoutesToEntity(location, item, mean)
                }
                transitRoutes={searchContextState.responseTransitRoutes}
                toggleTransitRoute={(item) =>
                  toggleTransitRoutesToEntity(location, item)
                }
                closeModal={setIsShownPreferredLocationsModal}
              />
            )}
        </div>
      </>
    );
  }
);

export default SearchResultContainer;

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
  IApiMapboxStyle,
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
import { UserActionTypes, UserContext } from "../context/UserContext";
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
import { useTools } from "../hooks/tools";
import { LoadingMessage } from "../on-office/OnOfficeContainer";

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
  groupedEntries?: EntityGroup[];
  config: ApiSearchResultSnapshotConfig;
  onConfigChange: (config: ApiSearchResultSnapshotConfig) => void;
  snapshotId: string;
  extraMapboxStyles?: IApiMapboxStyle[];
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
  onPoiAdd?: (poi: ApiOsmLocation) => void;
  isTrial: boolean;
  userPoiIcons?: IApiUserPoiIcons;
  isNewSnapshot?: boolean;
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
      onPoiAdd,
      isTrial,
      userPoiIcons,
      isNewSnapshot,
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

    const { userDispatch } = useContext(UserContext);
    const { searchContextState, searchContextDispatch } =
      useContext(SearchContext);

    const { fetchRoutes, fetchTransitRoutes } = useRouting();
    const { createDirectLink, createCodeSnippet, getActualUser } = useTools();

    const isEmbeddedMode = [
      MapDisplayModesEnum.EMBED,
      MapDisplayModesEnum.EMBED_INTEGRATION,
    ].includes(mapDisplayMode);

    const isThemeKf = searchContextState.responseConfig?.theme === "KF";

    const isMapMenuShown =
      !isEmbeddedMode ||
      (searchContextState.responseConfig?.hideMapMenu
        ? false
        : isEmbeddedMode && !isThemeKf);

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

    const [isMapMenuOpen, setIsMapMenuOpen] = useState(
      isEmbeddedMode && searchContextState.responseConfig?.isMapMenuCollapsed
        ? false
        : isMapMenuShown
    );
    const [availableMeans, setAvailableMeans] = useState<
      MeansOfTransportation[]
    >([]);
    const [resultGroupEntities, setResultGroupEntities] = useState<
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
    const [editorTabProps, setEditorTabProps] = useState<IEditorTabProps>();
    const [exportTabProps, setExportTabProps] = useState<IExportTabProps>();

    const user = getActualUser();
    const isIntegrationUser = "integrationUserId" in user;
    const extraMapboxStyles = isIntegrationUser
      ? user.config.extraMapboxStyles
      : user.additionalMapBoxStyles;

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

      // 1. Don't remember why we use 'defaultActiveMeans' instead of 'meansFromResponse'
      // 2. 'filter' is added to sort the means which are not actually present in the snapshot
      // (a fix for the first iterations of recent config feature which should be removed later)
      const activeMeans = searchContextState.responseConfig?.defaultActiveMeans
        ? searchContextState.responseConfig.defaultActiveMeans.filter(
            (activeMean) => meansFromResponse.includes(activeMean)
          )
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
      setResultGroupEntities(groupsFilteredByActiveMeans);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      searchContextState.responseGroupedEntities,
      searchContextState.responseActiveMeans,
    ]);

    useEffect(() => {
      if (
        mapDisplayMode !== MapDisplayModesEnum.EDITOR ||
        !searchContextState.availGroupedEntities?.length ||
        !searchContextState.responseConfig ||
        !searchContextState.snapshotId
      ) {
        return;
      }

      const handleConfigChange = (
        config: ApiSearchResultSnapshotConfig
      ): void => {
        if (
          searchContextState.responseConfig?.mapBoxMapId !==
            config.mapBoxMapId ||
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
      };

      setEditorTabProps({
        extraMapboxStyles,
        availableMeans: deriveAvailableMeansFromResponse(
          searchContextState.searchResponse
        ),
        groupedEntries: searchContextState.availGroupedEntities,
        config: searchContextState.responseConfig,
        onConfigChange: handleConfigChange,
        snapshotId: searchContextState.snapshotId,
        isNewSnapshot: !!isNewSnapshot,
      });

      setExportTabProps({
        codeSnippet: createCodeSnippet(searchContextState.responseToken),
        directLink: createDirectLink(searchContextState.responseToken),
        searchAddress: searchContextState.placesLocation?.label,
        snapshotId: searchContextState.snapshotId,
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      isNewSnapshot,
      mapDisplayMode,
      extraMapboxStyles,
      searchContextState.availGroupedEntities,
      searchContextState.mapCenter,
      searchContextState.mapZoomLevel,
      searchContextState.placesLocation?.label,
      searchContextState.responseConfig,
      searchContextState.responseToken,
      searchContextState.searchResponse,
      searchContextState.snapshotId,
    ]);

    if (!searchResponse || !mapBoxToken) {
      return <LoadingMessage />;
    }

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
        userEmail: !isIntegrationUser ? user.email : undefined,
        meansOfTransportation: [
          MeansOfTransportation.WALK,
          MeansOfTransportation.BICYCLE,
          MeansOfTransportation.CAR,
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
        userEmail: !isIntegrationUser ? user.email : undefined,
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

    const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

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

    const toggleSatelliteMapMode = (): void => {
      setMapBoxMapIds({
        current: mapBoxMapIds.previous,
        previous: mapBoxMapIds.current,
      });
    };

    const toggleAllLocalities = (): void => {
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
    const resUserPoiIcons =
      userPoiIcons || (!isIntegrationUser ? user.poiIcons : undefined);

    const isMapMenuKarlaFrickeShown =
      isThemeKf &&
      (!isEmbeddedMode || !searchContextState.responseConfig?.hideMapMenu);

    const isMeanTogglesShown =
      !isEmbeddedMode || !searchContextState.responseConfig?.hideMeanToggles;

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
              groupedEntities={resultGroupEntities ?? []}
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
              userMapPoiIcons={resUserPoiIcons?.mapPoiIcons}
              ref={mapRef}
            />
          </div>
          {isMapMenuShown && <ShowMapMenuButton />}
          {isMapMenuKarlaFrickeShown && (
            <MapMenuKarlaFricke
              groupedEntries={(resultGroupEntities ?? [])
                .filter(
                  (ge) =>
                    ge.items.length && ge.title !== realEstateListingsTitle
                )
                .sort((a, b) => (a.title > b.title ? 1 : -1))}
              isMapMenuOpen={isMapMenuOpen}
              isShownPreferredLocationsModal={isShownPreferredLocationsModal}
              togglePreferredLocationsModal={setIsShownPreferredLocationsModal}
              userMenuPoiIcons={resUserPoiIcons?.menuPoiIcons}
            />
          )}
          {isMapMenuShown && (
            <MapMenu
              isMapMenuOpen={isMapMenuOpen}
              censusData={searchContextState.censusData}
              federalElectionData={searchContextState.federalElectionData}
              particlePollutionData={searchContextState.particlePollutionData}
              locationIndexData={searchContextState.locationIndexData}
              groupedEntries={resultGroupEntities ?? []}
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
              userMenuPoiIcons={resUserPoiIcons?.menuPoiIcons}
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

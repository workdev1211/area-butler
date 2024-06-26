import {
  FC,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  IGotoMapCenter,
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import {
  ApiCoordinates,
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  AreaButlerExportTypesEnum,
  IApiUserPoiIcons,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../shared/types/types";
import {
  deriveAvailableMeansFromResponse,
  deriveEntityGroupsByActiveMeans,
  preferredLocationsTitle,
  toastSuccess,
  toggleEntityVisibility,
} from "../../shared/shared.functions";
import Map from "../../map/Map";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { useRouting } from "../../hooks/routing";
import "./SearchResultContainer.scss";
import MeansToggle from "./components/means-toggle/MeansToggle";
import MapMenu from "../../map-menu/MapMenu";
import { defaultColor } from "../../../../shared/constants/constants";
import PreferredLocationsModal from "../../map-menu/karla-fricke/PreferredLocationsModal";
import {
  defaultMapboxStyles,
  defaultMapZoom,
  MapboxStyleLabelsEnum,
} from "../../shared/shared.constants";
import MapMenuKarlaFricke from "../../map-menu/karla-fricke/MapMenuKarlaFricke";
import { useTools } from "../../hooks/tools";
import FilterMenu from "../../map-menu/FilterMenu";
import FilterMenuButton from "./components/FilterMenuButton";
import {
  EntityGroup,
  ICurrentMapRef,
  IEditorTabProps,
  IExportTabProps,
  ResultEntity,
} from "../../shared/search-result.types";
import MapMenuButton from "./components/MapMenuButton";
import { realEstateListingsTitle } from "../../../../shared/constants/real-estate";
import MapClipCropModal from "./components/map-clip-crop-modal/MapClipCropModal";
import { Loading } from "../Loading";
import { Iso3166_1Alpha2CountriesEnum } from "../../../../shared/types/location";
import { useGoogleMapsApi } from "../../hooks/google";
import { ConfigContext } from "../../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";
import MyVivendaMapMenu, {
  TMyVivendaMapMenuProps,
} from "../../my-vivenda/components/MyVivendaMapMenu";
import { useIntegrationTools } from "../../hooks/integration/integrationtools";
import { IntlKeys } from "../../i18n/keys";

interface ISearchResultContainerProps {
  mapboxAccessToken: string;
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

export const searchResContainId = "search-result-container";
const mapWithLegendId = "map-with-legend";

const SearchResultContainer = forwardRef<
  ICurrentMapRef,
  ISearchResultContainerProps
>(
  (
    {
      mapboxAccessToken,
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
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

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

    const { integrationType } = useContext(ConfigContext);
    const { userDispatch } = useContext(UserContext);
    const { searchContextState, searchContextDispatch } =
      useContext(SearchContext);

    const { fetchRoutes, fetchTransitRoutes } = useRouting();
    const { createDirectLink, getActualUser } = useTools();
    const { sendToIntegration } = useIntegrationTools();
    const isLoadedGoogleMapsApi = useGoogleMapsApi();
    const { t } = useTranslation();

    const isEmbeddedMode = mapDisplayMode === MapDisplayModesEnum.EMBEDDED;
    const isThemeKf = searchContextState.responseConfig?.theme === "KF";

    const isMapMenuPresent =
      !isEmbeddedMode ||
      (searchContextState.responseConfig?.hideMapMenu
        ? false
        : isEmbeddedMode && !isThemeKf);

    const initMapboxMapIds = {
      current:
        searchContextState.responseConfig?.mapBoxMapId ||
        defaultMapboxStyles.find(
          ({ label }) => label === MapboxStyleLabelsEnum.CLASSIC
        )!.key,
      previous: defaultMapboxStyles.find(
        ({ label }) => label === MapboxStyleLabelsEnum.SATELLITE
      )!.key,
    };

    const [isMapMenuOpen, setIsMapMenuOpen] = useState(
      isEmbeddedMode && searchContextState.responseConfig?.isMapMenuCollapsed
        ? false
        : isMapMenuPresent
    );
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [availableMeans, setAvailableMeans] = useState<
      MeansOfTransportation[]
    >([]);
    const [resultGroupEntities, setResultGroupEntities] = useState<
      EntityGroup[]
    >([]);
    const [hideIsochrones, setHideIsochrones] = useState<boolean>(
      !!searchContextState.responseConfig?.hideIsochrones
    );
    const [mapboxMapIds, setMapboxMapIds] = useState(initMapboxMapIds);
    const [preferredLocationsGroup, setPreferredLocationsGroup] =
      useState<EntityGroup>();
    const [isShownPreferredLocationsModal, setIsShownPreferredLocationsModal] =
      useState(false);
    const [editorTabProps, setEditorTabProps] = useState<IEditorTabProps>();
    const [exportTabProps, setExportTabProps] = useState<IExportTabProps>();
    const [mapClipping, setMapClipping] = useState<string>();
    const [primaryColor, setPrimaryColor] = useState<string>();

    const user = getActualUser();
    const isIntegrationUser = "integrationUserId" in user;
    const extraMapboxStyles = isIntegrationUser
      ? user.config.extraMapboxStyles
      : user.extraMapboxStyles;

    const directLink = createDirectLink();
    const screenshotName = t(IntlKeys.snapshotEditor.screenshotName);

    useEffect(() => {
      if (
        containerRef?.offsetWidth &&
        containerRef?.offsetWidth < 769
      ) {
        setIsMapMenuOpen(false);
      }
    }, [containerRef]);

    useEffect(() => {
      setMapboxMapIds(initMapboxMapIds);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchContextState.responseConfig?.mapBoxMapId]);

    useEffect(() => {
      setHideIsochrones(!!searchContextState.responseConfig?.hideIsochrones);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchContextState.responseConfig?.hideIsochrones]);

    // Customize primary color
    useEffect(() => {
      const primaryColor =
        searchContextState.responseConfig?.primaryColor || defaultColor;

      setPrimaryColor(
        searchContextState.responseConfig?.primaryColor || defaultColor
      );
      
      const r = containerRef;
      r?.style.setProperty("--primary", primaryColor);
      r?.style.setProperty("--custom-primary", primaryColor);
    }, [searchContextState.responseConfig?.primaryColor, containerRef]);

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

      const groupsByActMeans = deriveEntityGroupsByActiveMeans(
        searchContextState.responseGroupedEntities,
        searchContextState.responseActiveMeans
      );

      const foundPrefLocGroup = groupsByActMeans.find(
        (group) => group.items[0]?.label === preferredLocationsTitle
      );

      setPreferredLocationsGroup(foundPrefLocGroup);
      setResultGroupEntities(groupsByActMeans);

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
      searchContextState.responseTokens,
      searchContextState.searchResponse,
      searchContextState.snapshotId,
    ]);

    const isMapDataNotLoaded =
      !searchResponse ||
      !mapboxAccessToken ||
      (!isEmbeddedMode && !isLoadedGoogleMapsApi);

    if (isMapDataNotLoaded) {
      return <Loading />;
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
        destinations: [
          {
            title: item.name || `${item.id}`,
            coordinates: item.coordinates,
          },
        ],
        meansOfTransportation: [
          MeansOfTransportation.WALK,
          MeansOfTransportation.BICYCLE,
          MeansOfTransportation.CAR,
        ],
        origin: origin,
        userEmail: !isIntegrationUser ? user.email : undefined,
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
        destinations: [
          {
            title: item.name || `${item.id}`,
            coordinates: item.coordinates,
          },
        ],
        origin: origin,
        userEmail: !isIntegrationUser ? user.email : undefined,
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
        entityVisibility: newEntityVisibility,
      };

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: newConfig,
      });
    };

    const toggleSatelliteMapMode = (): void => {
      setMapboxMapIds({
        current: mapboxMapIds.previous,
        previous: mapboxMapIds.current,
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

    const handleMapClipCrop = async (
      croppedMapClipping?: string
    ): Promise<void> => {
      if (!croppedMapClipping) {
        setMapClipping(undefined);
        return;
      }

      searchContextDispatch({
        type: SearchContextActionTypes.ADD_MAP_CLIPPING,
        payload: {
          mapClippingDataUrl: croppedMapClipping,
        },
      });

      if (integrationType) {
        void sendToIntegration({
          base64Image: croppedMapClipping,
          exportType: AreaButlerExportTypesEnum.SCREENSHOT,
          filename: `${screenshotName}.png`,
          fileTitle: screenshotName,
        });
      } else {
        toastSuccess(t(IntlKeys.snapshotEditor.cropSuccess));
      }

      setMapClipping(undefined);
    };

    const containerClasses = `search-result-container theme-${searchContextState.responseConfig?.theme}`;
    const resUserPoiIcons =
      userPoiIcons || (!isIntegrationUser ? user.poiIcons : undefined);

    const isMapMenuKFPresent =
      isThemeKf &&
      (!isEmbeddedMode || !searchContextState.responseConfig?.hideMapMenu);

    const isMeanTogglesShown =
      !isEmbeddedMode || !searchContextState.responseConfig?.hideMeanToggles;

    const myVivendaMapMenuProps: TMyVivendaMapMenuProps = {
      isMapMenuOpen,
      searchAddress,
      groupedEntries: resultGroupEntities ?? [],
      resetPosition: () => {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_MAP_CENTER,
          payload: searchResponse?.centerOfInterest?.coordinates!,
        });

        searchContextDispatch({
          type: SearchContextActionTypes.GOTO_MAP_CENTER,
          payload: { goto: true },
        });
      },
      routes: searchContextState.responseRoutes,
      transitRoutes: searchContextState.responseTransitRoutes,
      toggleRoute: (item, mean) => toggleRoutesToEntity(location, item, mean),
      toggleTransitRoute: (item) => toggleTransitRoutesToEntity(location, item),
      toggleAllLocalities,
      userMenuPoiIcons: resUserPoiIcons?.menuPoiIcons,
      config: searchContextState.responseConfig,
    };

    const MapMenuComponent: FC = () =>
      integrationType === IntegrationTypesEnum.MY_VIVENDA ? (
        <MyVivendaMapMenu {...myVivendaMapMenuProps} />
      ) : (
        <MapMenu
          editorTabProps={editorTabProps}
          exportTabProps={exportTabProps}
          mapDisplayMode={mapDisplayMode}
          openUpgradeSubscriptionModal={(message) => {
            userDispatch({
              type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
              payload: { open: true, message },
            });
          }}
          saveConfig={saveConfig}
          showInsights={isEditorMode}
          censusData={searchContextState.censusData}
          federalElectionData={searchContextState.federalElectionData}
          particlePollutionData={searchContextState.particlePollutionData}
          locationIndexData={searchContextState.locationIndexData}
          {...myVivendaMapMenuProps}
        />
      );

    return (
      <div
        id={searchResContainId}
        className={containerClasses}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        ref={(newRef) => setContainerRef(newRef)}
      >
        {/* NOT SURE ABOUT ITS USAGE - HAS BEEN MOVED HERE FROM SNAPSHOT_EDITOR_PAGE AND MAP_PAGE COMPONENTS */}
        {/* Required for the addition of custom POIs */}
        {/*{isEditorMode && (*/}
        {/*  <div className="hidden">*/}
        {/*    <GooglePlacesAutocomplete*/}
        {/*      apiOptions={googleMapsApiOptions}*/}
        {/*      autocompletionRequest={{*/}
        {/*        componentRestrictions: {*/}
        {/*          country: (isIntegrationUser*/}
        {/*            ? user.config.allowedCountries*/}
        {/*            : user.allowedCountries) || [*/}
        {/*            Iso3166_1Alpha2CountriesEnum.DE,*/}
        {/*          ],*/}
        {/*        },*/}
        {/*      }}*/}
        {/*      minLengthAutocomplete={5}*/}
        {/*      selectProps={{}}*/}
        {/*      apiKey={googleApiKey}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*)}*/}
        {mapClipping && (
          <MapClipCropModal
            mapClipping={mapClipping}
            closeModal={handleMapClipCrop}
            color={primaryColor?.slice(1)}
            directLink={directLink}
          />
        )}

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
                hideIsochrones={hideIsochrones}
              />
            )}
          </div>

          <Map
            mapboxAccessToken={mapboxAccessToken}
            mapboxMapId={mapboxMapIds.current}
            searchResponse={searchResponse}
            searchAddress={searchAddress}
            groupedEntities={resultGroupEntities ?? []}
            directLink={directLink}
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
              mapZoomLevel || searchContextState.mapZoomLevel || defaultMapZoom
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
            addMapClipping={(mapClippingDataUrl) => {
              setMapClipping(mapClippingDataUrl);
            }}
            hideIsochrones={hideIsochrones}
            setHideIsochrones={setHideIsochrones}
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
            isIntegration={isIntegrationUser}
            allowedCountries={
              (isIntegrationUser
                ? user.config.allowedCountries
                : user.allowedCountries) || [Iso3166_1Alpha2CountriesEnum.DE]
            }
            ref={mapRef}
          />
        </div>
        {isMapMenuPresent && (
          <MapMenuButton
            isEditorMode={isEditorMode}
            isMenuOpen={isMapMenuOpen}
            setIsMenuOpen={setIsMapMenuOpen}
          />
        )}
        {searchContextState.responseConfig?.isFilterMenuAvail && (
          <FilterMenuButton
            isEditorMode={isEditorMode}
            toggleIsMenuOpen={() => {
              setIsFilterMenuOpen(!isFilterMenuOpen);
            }}
          />
        )}
        {isMapMenuKFPresent && (
          <MapMenuKarlaFricke
            groupedEntries={(resultGroupEntities ?? [])
              .filter(
                (ge) => ge.items.length && ge.title !== realEstateListingsTitle
              )
              .sort((a, b) => (a.title > b.title ? 1 : -1))}
            isMapMenuOpen={isMapMenuOpen}
            isShownPreferredLocationsModal={isShownPreferredLocationsModal}
            togglePreferredLocationsModal={setIsShownPreferredLocationsModal}
            userMenuPoiIcons={resUserPoiIcons?.menuPoiIcons}
          />
        )}
        {isMapMenuPresent && <MapMenuComponent />}
        {searchContextState.responseConfig?.isFilterMenuAvail && (
          <FilterMenu
            isFilterMenuOpen={isFilterMenuOpen}
            isEditorMode={isEditorMode}
            groupEntities={resultGroupEntities}
            setGroupEntities={setResultGroupEntities}
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
    );
  }
);

export default SearchResultContainer;

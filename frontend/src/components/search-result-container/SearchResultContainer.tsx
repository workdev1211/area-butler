import {
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
  AreaButlerExportTypesEnum,
  IApiPoiIcons,
  MapDisplayModesEnum,
  MeansOfTransportation,
  OsmName,
} from "../../../../shared/types/types";
import {
  deriveAvailableMeansFromResponse,
  toastSuccess,
} from "../../shared/shared.functions";
import Map from "../../map/Map";
import { useRouting } from "../../hooks/routing";
import "./SearchResultContainer.scss";
import MeansToggle from "./components/means-toggle/MeansToggle";
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
  ResultEntity,
} from "../../shared/search-result.types";
import MapMenuButton from "./components/MapMenuButton";
import MapClipCropModal, {
  CropActionsEnum,
} from "./components/map-clip-crop-modal/MapClipCropModal";
import { Loading } from "../Loading";
import { Iso3166_1Alpha2CountriesEnum } from "../../../../shared/types/location";
import { useGoogleMapsApi } from "../../hooks/google";
import { ConfigContext } from "../../context/ConfigContext";
import { useIntegrationTools } from "../../hooks/integration/integrationtools";
import { IntlKeys } from "../../i18n/keys";
import MapMenuContainer from "./components/MapMenuContainer";
import {
  derivePoiGroupsByActMeans,
  toggleEntityVisibility,
} from "../../shared/pois.functions";
import { saveAs } from "file-saver";
import { checkIsDarkColor } from "shared/shared.functions";
import { useUserState } from "../../hooks/userstate";

interface ISearchResultContainerProps {
  mapboxAccessToken: string;
  mapDisplayMode: MapDisplayModesEnum;
  saveConfig?: () => Promise<void>;
  onPoiAdd?: (poi: ApiOsmLocation) => void;
  isTrial: boolean;
  poiIcons?: IApiPoiIcons;
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
      mapDisplayMode,
      saveConfig,
      onPoiAdd,
      isTrial,
      poiIcons,
      isNewSnapshot,
    },
    parentMapRef
  ) => {
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(
      null
    );

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

    const {
      searchContextState: {
        entityGroupsByActMeans,
        gotoMapCenter,
        highlightId,
        location,
        mapCenter,
        mapZoomLevel,
        placesLocation,
        responseConfig,
        responseActiveMeans,
        responseGroupedEntities,
        responseRoutes,
        responseTransitRoutes,
        searchResponse,
        transportationParams,
      },
      searchContextDispatch,
    } = useContext(SearchContext);

    const { integrationType } = useContext(ConfigContext);

    const { fetchRoutes, fetchTransitRoutes } = useRouting();
    const { createDirectLink } = useTools();
    const { getUserForEmbedded } = useUserState();
    const { sendToIntegration } = useIntegrationTools();
    const isLoadedGoogleMapsApi = useGoogleMapsApi();
    const { t } = useTranslation();

    const isEmbeddedMode = mapDisplayMode === MapDisplayModesEnum.EMBEDDED;
    const isThemeKf = responseConfig?.theme === "KF";

    const isMapMenuPresent =
      !isEmbeddedMode ||
      (responseConfig?.hideMapMenu ? false : isEmbeddedMode && !isThemeKf);

    const initMapboxMapIds = {
      current:
        responseConfig?.mapBoxMapId ||
        defaultMapboxStyles.find(
          ({ label }) => label === MapboxStyleLabelsEnum.CLASSIC
        )!.key,
      previous: defaultMapboxStyles.find(
        ({ label }) => label === MapboxStyleLabelsEnum.SATELLITE
      )!.key,
    };

    const [isMapMenuOpen, setIsMapMenuOpen] = useState(
      isEmbeddedMode && responseConfig?.isMapMenuCollapsed
        ? false
        : isMapMenuPresent
    );
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [availableMeans, setAvailableMeans] = useState<
      MeansOfTransportation[]
    >([]);
    const [hideIsochrones, setHideIsochrones] = useState<boolean>(
      !!responseConfig?.hideIsochrones
    );
    const [mapboxMapIds, setMapboxMapIds] = useState(initMapboxMapIds);
    const [preferredLocationsGroup, setPreferredLocationsGroup] =
      useState<EntityGroup>();
    const [isShownPreferredLocationsModal, setIsShownPreferredLocationsModal] =
      useState(false);
    const [mapClipping, setMapClipping] = useState<string>();
    const [primaryColor, setPrimaryColor] = useState<string>();

    const user = getUserForEmbedded();
    const isIntegrationUser = !!(user && "integrationUserId" in user);

    const directLink = createDirectLink();
    const screenshotName = t(IntlKeys.snapshotEditor.screenshotName);
    const searchAddress = placesLocation?.label;
    const resultLocation = mapCenter ?? location!;

    useEffect(() => {
      if (containerRef?.offsetWidth && containerRef?.offsetWidth < 769) {
        setIsMapMenuOpen(false);
      }
    }, [containerRef]);

    useEffect(() => {
      setMapboxMapIds(initMapboxMapIds);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [responseConfig?.mapBoxMapId]);

    useEffect(() => {
      setHideIsochrones(!!responseConfig?.hideIsochrones);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [responseConfig?.hideIsochrones]);

    // Customize primary color
    useEffect(() => {
      const primaryColor = responseConfig?.primaryColor || defaultColor;
      const invertColor = responseConfig?.isInvertBaseColor;
      setPrimaryColor(responseConfig?.primaryColor || defaultColor);

      const r = containerRef;
      r?.style.setProperty("--primary", primaryColor);
      r?.style.setProperty("--custom-primary", primaryColor);

      const isDark = checkIsDarkColor(primaryColor, invertColor);
      r?.style.setProperty(
        "--collapse-opened-text-color",
        isDark ? "#fff" : "#000"
      );
      //
    }, [
      responseConfig?.primaryColor,
      containerRef,
      responseConfig?.isInvertBaseColor,
    ]);

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
      const activeMeans = responseConfig?.defaultActiveMeans
        ? responseConfig.defaultActiveMeans.filter((activeMean) =>
            meansFromResponse.includes(activeMean)
          )
        : meansFromResponse;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS,
        payload: [...activeMeans],
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchResponse, responseConfig?.defaultActiveMeans]);

    // react to active means change (changes in POIs)
    useEffect(() => {
      setPreferredLocationsGroup(undefined);

      const groupsByActMeans = derivePoiGroupsByActMeans(
        responseGroupedEntities,
        responseActiveMeans
      );

      searchContextDispatch({
        type: SearchContextActionTypes.SET_ENT_GROUPS_BY_ACT_MEANS,
        payload: groupsByActMeans,
      });

      const foundPrefLocGroup = groupsByActMeans.find(
        (group) => group.name === OsmName.favorite
      );

      setPreferredLocationsGroup(foundPrefLocGroup);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [responseGroupedEntities, responseActiveMeans]);

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
      const existing = responseRoutes.find(
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
            ...responseRoutes.filter(
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
        userEmail: !isIntegrationUser ? user?.email : undefined,
      });

      if (routesResult.length) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
          payload: [
            ...responseRoutes,
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
      const existing = responseTransitRoutes.find(
        (r) =>
          r.coordinates.lat === item.coordinates.lat &&
          r.coordinates.lng === item.coordinates.lng
      );

      if (existing) {
        const newTransitRoutes = [
          ...responseTransitRoutes.filter(
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
        userEmail: !isIntegrationUser ? user?.email : undefined,
      });

      if (routesResult.length) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES,
          payload: [
            ...responseTransitRoutes,
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
      if (!responseConfig) {
        return;
      }

      const newEntityVisibility = toggleEntityVisibility(item, responseConfig);

      const newConfig = {
        ...responseConfig,
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

    const handleMapClipCrop = async (
      croppedMapClipping?: string,
      action?: CropActionsEnum
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

      if (integrationType && action === CropActionsEnum.SEND_TO_INTEGRATION) {
        void sendToIntegration({
          base64Image: croppedMapClipping,
          exportType: AreaButlerExportTypesEnum.SCREENSHOT,
          filename: `${screenshotName}.png`,
          fileTitle: screenshotName,
        });
      } else if (action === CropActionsEnum.DOWNLOAD) {
        saveAs(
          croppedMapClipping,
          `${t(IntlKeys.snapshotEditor.screenshotName)}-${searchAddress}-${t(
            IntlKeys.snapshotEditor.dataTab.mapSection
          )}.png`
        );
      } else {
        toastSuccess(t(IntlKeys.snapshotEditor.cropSuccess));
      }

      setMapClipping(undefined);
    };
    const isDark = checkIsDarkColor(
      responseConfig?.primaryColor || defaultColor,
      responseConfig?.isInvertBaseColor
    );
    let containerClasses = `search-result-container theme-${
      responseConfig?.theme
    } ${isDark ? "dark" : "bright"}-primary-color`;

    const resPoiIcons = poiIcons || user?.config.poiIcons;

    const isMapMenuKFPresent =
      isThemeKf && (!isEmbeddedMode || !responseConfig?.hideMapMenu);

    const isMeanTogglesShown =
      !isEmbeddedMode || !responseConfig?.hideMeanToggles;

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
            outputLanguage={responseConfig?.language}
            entityGroups={(entityGroupsByActMeans ?? []).filter(
              (ge) =>
                ge.items.length && ge.name !== OsmName.property && ge.active
            )}
            mapClipping={mapClipping}
            closeModal={handleMapClipCrop}
            color={primaryColor?.slice(1)}
            invertColor={responseConfig?.isInvertBaseColor}
            directLink={directLink}
            menuPoiIcons={resPoiIcons?.menuPoiIcons}
            transportationParams={transportationParams}
            activeMeans={hideIsochrones ? [] : responseActiveMeans}
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
                transportationParams={transportationParams}
                activeMeans={responseActiveMeans}
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
            groupedEntities={entityGroupsByActMeans}
            directLink={directLink}
            means={{
              byFoot: responseActiveMeans.includes(MeansOfTransportation.WALK),
              byBike: responseActiveMeans.includes(
                MeansOfTransportation.BICYCLE
              ),
              byCar: responseActiveMeans.includes(MeansOfTransportation.CAR),
            }}
            mapCenter={mapCenter || searchResponse.centerOfInterest.coordinates}
            mapZoomLevel={mapZoomLevel || defaultMapZoom}
            highlightId={highlightId}
            setHighlightId={(highlightId) =>
              searchContextDispatch({
                type: SearchContextActionTypes.SET_HIGHLIGHT_ID,
                payload: highlightId,
              })
            }
            routes={responseRoutes}
            transitRoutes={responseTransitRoutes}
            mapDisplayMode={mapDisplayMode}
            config={responseConfig}
            onPoiAdd={onPoiAdd}
            hideEntity={hideEntity}
            setMapCenterZoom={(newMapCenter, newMapZoomLevel) => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_MAP_CENTER_ZOOM,
                payload: {
                  mapCenter: {
                    ...newMapCenter,
                  },
                  mapZoomLevel: newMapZoomLevel,
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
            gotoMapCenter={gotoMapCenter}
            setGotoMapCenter={(data: IGotoMapCenter | undefined) => {
              searchContextDispatch({
                type: SearchContextActionTypes.GOTO_MAP_CENTER,
                payload: data,
              });
            }}
            isTrial={isTrial}
            mapPoiIcons={resPoiIcons?.mapPoiIcons}
            isIntegration={isIntegrationUser}
            allowedCountries={
              user?.config.allowedCountries || [Iso3166_1Alpha2CountriesEnum.DE]
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
        {responseConfig?.isFilterMenuAvail && (
          <FilterMenuButton
            isEditorMode={isEditorMode}
            toggleIsMenuOpen={() => {
              setIsFilterMenuOpen(!isFilterMenuOpen);
            }}
          />
        )}
        {isMapMenuKFPresent && (
          <MapMenuKarlaFricke
            isMapMenuOpen={isMapMenuOpen}
            isShownPreferredLocationsModal={isShownPreferredLocationsModal}
            togglePreferredLocationsModal={setIsShownPreferredLocationsModal}
            menuPoiIcons={resPoiIcons?.menuPoiIcons}
          />
        )}
        {isMapMenuPresent && (
          <MapMenuContainer
            isMapMenuOpen={isMapMenuOpen}
            isNewSnapshot={!!isNewSnapshot}
            mapDisplayMode={mapDisplayMode}
            mapRef={mapRef?.current}
            saveConfig={saveConfig}
            toggleRoutesToEntity={toggleRoutesToEntity}
            toggleTransitRoutesToEntity={toggleTransitRoutesToEntity}
            poiIcons={resPoiIcons}
          />
        )}
        {responseConfig?.isFilterMenuAvail && (
          <FilterMenu
            isFilterMenuOpen={isFilterMenuOpen}
            isEditorMode={isEditorMode}
          />
        )}
        {isThemeKf &&
          preferredLocationsGroup &&
          isShownPreferredLocationsModal && (
            <PreferredLocationsModal
              entityGroup={preferredLocationsGroup}
              routes={responseRoutes}
              toggleRoute={(item, mean) =>
                toggleRoutesToEntity(resultLocation, item, mean)
              }
              transitRoutes={responseTransitRoutes}
              toggleTransitRoute={(item) =>
                toggleTransitRoutesToEntity(resultLocation, item)
              }
              closeModal={setIsShownPreferredLocationsModal}
            />
          )}
      </div>
    );
  }
);

export default SearchResultContainer;

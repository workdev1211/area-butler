import {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";
import { renderToStaticMarkup } from "react-dom/server";

import { useTranslation } from "react-i18next";
import i18 from "i18n";
import { IntlKeys } from "i18n/keys";

import * as L from "leaflet";
// LEFT JUST IN CASE - the old touch screen solution
// import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-touch-helper";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import leafletShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

import "./Map.scss";

import FormModal, { ModalConfig } from "components/FormModal";
import { IGotoMapCenter } from "context/SearchContext";
import {
  convertMetersToMinutes,
  groupBy,
  randomizeCoordinates,
} from "../../../shared/functions/shared.functions";
import {
  ApiRoute,
  ApiTransitRoute,
  EntityRoute,
  EntityTransitRoute,
} from "../../../shared/types/routing";
import {
  ApiCoordinates,
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  IApiPoiIcon,
  MapDisplayModesEnum,
  MeansOfTransportation,
  OsmName,
} from "../../../shared/types/types";
import googleIcon from "../assets/icons/google.svg";
import myLocationIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import { ReactComponent as DefaultMarker } from "../assets/icons/map-marker-default.svg";
import intMyLocationIcon from "../assets/icons/kudiba.svg";
import busStopIcon from "../assets/icons/pois/bus_stop.svg";
import stationIcon from "../assets/icons/pois/station.svg";
import bikeIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import eyeIcon from "../assets/icons/eye.svg";
import areaButlerLogo from "../assets/img/logo.svg";
import areaButlerWhiteTextLogo from "../assets/img/logo-text-white.svg";
import {
  EntityGroup,
  ICurrentMapRef,
  poiSearchContainerId,
  ResultEntity,
} from "../shared/search-result.types";
import {
  deriveAddressFromCoordinates,
  deriveIconForPoiGroup,
  getPreferredLocationsIcon,
  getRealEstateListingsIcon,
  timeToHumanReadable,
} from "../shared/shared.functions";
import AddPoiFormHandler from "./components/add-poi/AddPoiFormHandler";
import satelliteIcon from "../assets/icons/satellite.svg";
import { getRealEstateCost } from "../shared/real-estate.functions";
import { IPoiIcon } from "../shared/shared.types";
import {
  defaultAmenityIconSize,
  defaultMapboxStyles,
  defaultMapZoom,
  defaultMyLocationIconSize,
  MapboxStyleLabelsEnum,
} from "../shared/shared.constants";
import { searchResContainId } from "../components/search-result-container/SearchResultContainer";
import { Iso3166_1Alpha2CountriesEnum } from "../../../shared/types/location";
import { OsmEntityMapper } from "../../../shared/types/osm-entity-mapper";

const osmEntityMapper = new OsmEntityMapper();

export class IdMarker extends L.Marker {
  entity: ResultEntity;
  searchAddress: string;
  config?: ApiSearchResultSnapshotConfig;
  hideEntity?: (entity: ResultEntity) => void;

  constructor({
    entity,
    latLng,
    searchAddress,
    config,
    hideEntity,
    options,
  }: {
    entity: ResultEntity;
    latLng: L.LatLngExpression;
    searchAddress: string;
    config?: ApiSearchResultSnapshotConfig;
    hideEntity?: (item: ResultEntity) => void;
    options?: L.MarkerOptions;
  }) {
    super(latLng, options);

    this.entity = entity;
    this.searchAddress = searchAddress;
    this.config = config;
    this.hideEntity = hideEntity;
  }

  getEntity(): ResultEntity {
    return this.entity;
  }

  setEntity(entity: ResultEntity): void {
    this.entity = entity;
  }

  createPopupContent(): void {
    const osmName = i18.t(
      (IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>)[
      this.entity.osmName
      ]
    );
    const entityTitle = this.entity.name || osmName;
    let cityFromSearch = "";

    if (this.searchAddress) {
      const searchAddressParts = this.searchAddress.split(",");
      cityFromSearch = searchAddressParts[searchAddressParts.length - 1];
    }

    const groupName = osmEntityMapper.getGrpNameByOsmName(this.entity.osmName);

    const searchString = [
      groupName
        ? i18.t(
          (
            IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>
          )[groupName]
        )
        : "",
      entityTitle,
      this.entity?.address?.street !== "undefined"
        ? this.entity.address?.street
        : "",
      this.entity?.address?.city
        ? this.entity?.address?.city
        : cityFromSearch.trim(),
    ].join(" ");

    const title =
      this.entity.osmName !== OsmName.property
        ? `<h4><a target="_blank" href="https://google.de/search?q=${encodeURIComponent(
          searchString
        )}"><span class="flex"><img class="w-4 h-4 mr-1" src=${googleIcon} alt="icon" />${i18.t(
          IntlKeys.snapshotEditor.moreInfo
        )}</a></h4>`
        : `${entityTitle}`;

    const isRealEstateListing = this.entity.osmName === OsmName.property;
    const isPreferredLocation = this.entity.osmName === OsmName.favorite;
    const isRealEstateListingOrPreferredAddress =
      isPreferredLocation || isRealEstateListing;

    const byFoot = this.entity.byFoot
      ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${walkIcon} alt="icon" /><span>${timeToHumanReadable(
        convertMetersToMinutes(
          this.entity.distanceInMeters,
          MeansOfTransportation.WALK
        )
      )}</span></span>`
      : "";

    const byBike = this.entity.byBike
      ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${bikeIcon} alt="icon" /><span>${timeToHumanReadable(
        convertMetersToMinutes(
          this.entity.distanceInMeters,
          MeansOfTransportation.BICYCLE
        )
      )}</span></span>`
      : "";

    const byCar = this.entity.byCar
      ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${carIcon} alt="icon" /><span>${timeToHumanReadable(
        convertMetersToMinutes(
          this.entity.distanceInMeters,
          MeansOfTransportation.CAR
        )
      )}</span></span>`
      : "";

    const street =
      this.entity?.address?.street &&
        this.entity?.address?.street !== "undefined"
        ? this.entity.address.street
        : null;

    if (this.entity.osmName !== OsmName.property) {
      let content = `<span class="font-semibold">${entityTitle}</span><br />${this.entity.name ? "<span>" + osmName + "</span><br />" : ""
        }<br />
        <span class="font-semibold mt-2">${title}</span><br />${street ? "<div>" + street + "</div><br />" : ""
        }<div class="flex gap-6">${!isRealEstateListingOrPreferredAddress ? byFoot : ""
        }${!isRealEstateListingOrPreferredAddress ? byBike : ""}${!isRealEstateListingOrPreferredAddress ? byCar : ""
        }</div>`;

      if (this.hideEntity) {
        content =
          content +
          `<br /><button id="hide-btn-${this.entity.id
          }" class="btn btn-link text-sm" style="height: 1rem; min-height: 1rem; padding: 0; font-size: 12px;">${i18.t(
            IntlKeys.snapshotEditor.hide
          )}</button>`;
      }

      this.bindPopup(content);
      return;
    }

    // real estate listing
    const realEstateData = this.entity.realEstateData;
    const realEstateInfoParts: string[] = [];

    if (this.config?.showAddress && street) {
      realEstateInfoParts.push(
        `<span class="font-semibold mt-2">${i18.t(
          IntlKeys.common.address
        )}: </span> ${street}`
      );
    }

    if (this.config?.realEstateSettings?.isTypeShown && realEstateData?.type) {
      realEstateInfoParts.push(
        `<span class="font-semibold mt-2">${i18.t(
          IntlKeys.snapshotEditor.objectType
        )}: </span> ${realEstateData.type}`
      );
    }

    if (
      !this.config?.realEstateSettings?.isCharacteristicsHidden &&
      realEstateData?.characteristics?.realEstateSizeInSquareMeters
    ) {
      const startingAt = realEstateData?.characteristics?.startingAt
        ? i18.t(IntlKeys.common.from)
        : "";

      realEstateInfoParts.push(
        `<span class="font-semibold mt-2">${i18.t(
          IntlKeys.snapshotEditor.size
        )}: </span> ${startingAt} ${realEstateData?.characteristics?.realEstateSizeInSquareMeters
        } &#13217;`
      );
    }

    if (
      !this.config?.realEstateSettings?.isCostStructureHidden &&
      realEstateData?.costStructure
    ) {
      realEstateInfoParts.push(
        `<span class="font-semibold mt-2">${i18.t(
          IntlKeys.common.price
        )}: </span> ${getRealEstateCost(realEstateData.costStructure)}`
      );
    }

    if (this.entity.externalUrl?.length) {
      realEstateInfoParts.push(
        `<a target="_blank" href="${this.entity.externalUrl
        }" class="real-estate-cta">${i18.t(
          IntlKeys.snapshotEditor.directlyToTheObject
        )} ></a>`
      );
    }

    if (this.hideEntity) {
      realEstateInfoParts.push(
        `<br /><button id="hide-btn-${this.entity.id
        }" class="btn btn-link text-sm" style="height: 1rem; min-height: 1rem; padding: 0; font-size: 12px;">${i18.t(
          IntlKeys.snapshotEditor.hide
        )}</button>`
      );
    }

    this.bindPopup(
      `<h4 class="font-semibold text-lg">${title}</h4><br />
          ${realEstateInfoParts.join("<br /><br />")}
          `
    );
  }

  createOpenPopup(): void {
    this.unbindPopup();

    if (!this.getPopup()) {
      this.createPopupContent();
    }

    this.openPopup();

    if (this.hideEntity) {
      const element = document.getElementById(`hide-btn-${this.entity.id}`);

      if (element) {
        element.onclick = () => {
          this.hideEntity!(this.entity);
        };
      }
    }
  }
}

let currentMap: L.Map | undefined;
let meansGroup = L.layerGroup();
let routesGroup = L.layerGroup();
let amenityMarkerGroup = L.markerClusterGroup();

const WALK_COLOR = "#c91444";
const BICYCLE_COLOR = "#8f72eb";
const CAR_COLOR = "#1f2937";

const MEAN_COLORS: { [key in keyof typeof MeansOfTransportation]: string } = {
  [MeansOfTransportation.CAR]: CAR_COLOR,
  [MeansOfTransportation.BICYCLE]: BICYCLE_COLOR,
  [MeansOfTransportation.WALK]: WALK_COLOR,
};

interface IMapProps {
  mapboxAccessToken: string;
  mapboxMapId: string;
  searchResponse: ApiSearchResponse;
  searchAddress: string;
  groupedEntities: EntityGroup[];
  mapCenter: ApiCoordinates;
  mapZoomLevel?: number;
  leafletMapId?: string;
  means: {
    byFoot: boolean;
    byBike: boolean;
    byCar: boolean;
  };
  highlightId?: string;
  setHighlightId: (highlightId?: string) => void;
  addMapClipping: (dataUrl: string) => void;
  routes: EntityRoute[];
  transitRoutes: EntityTransitRoute[];
  directLink?: string;
  mapDisplayMode: MapDisplayModesEnum;
  config?: ApiSearchResultSnapshotConfig;
  onPoiAdd?: (poi: ApiOsmLocation) => void;
  hideEntity?: (entity: ResultEntity) => void;
  setMapCenterZoom: (mapCenter: ApiCoordinates, mapZoomLevel: number) => void;
  hideIsochrones: boolean;
  setHideIsochrones: (value: boolean) => void;
  toggleSatelliteMapMode: () => void;
  isShownPreferredLocationsModal: boolean;
  togglePreferredLocationsModal: (
    isShownPreferredLocationsModal: boolean
  ) => void;
  gotoMapCenter: IGotoMapCenter | undefined;
  setGotoMapCenter: (data: IGotoMapCenter | undefined) => void;
  isTrial: boolean;
  mapPoiIcons?: IApiPoiIcon[];
  isIntegration: boolean;
  allowedCountries: Iso3166_1Alpha2CountriesEnum[];
}

interface IMapMemoProps extends IMapProps {
  ref: ForwardedRef<ICurrentMapRef>;
}

// TODO should be refactored
const isMapPropsEqual = (prevProps: IMapProps, nextProps: IMapProps) => {
  const mapboxTokenEqual =
    prevProps.mapboxAccessToken === nextProps.mapboxAccessToken;
  const mapboxMapIdEqual = prevProps.mapboxMapId === nextProps.mapboxMapId;
  const responseEqual =
    JSON.stringify(prevProps.searchResponse) ===
    JSON.stringify(nextProps.searchResponse);
  const searchAddressEqual =
    JSON.stringify(prevProps.searchAddress) ===
    JSON.stringify(nextProps.searchAddress);
  const groupedEntitiesEqual =
    JSON.stringify(prevProps.groupedEntities) ===
    JSON.stringify(nextProps.groupedEntities);
  const meansEqual =
    JSON.stringify(prevProps.means) === JSON.stringify(nextProps.means);
  const mapZoomLevelEqual = prevProps.mapZoomLevel === nextProps.mapZoomLevel;
  const highlightIdEqual = prevProps.highlightId === nextProps.highlightId;
  const routesEqual = prevProps.routes === nextProps.routes;
  const transitRoutesEqual =
    prevProps.transitRoutes === nextProps.transitRoutes;
  const configEqual =
    JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config);
  const hideIsochronesEqual =
    prevProps.hideIsochrones === nextProps.hideIsochrones;
  const gotoMapCenterEqual =
    JSON.stringify(prevProps.gotoMapCenter) ===
    JSON.stringify(nextProps.gotoMapCenter);
  const isTrialEqual = prevProps.isTrial === nextProps.isTrial;
  const mapPoiIconsEqual =
    JSON.stringify(prevProps.mapPoiIcons) ===
    JSON.stringify(nextProps.mapPoiIcons);

  return (
    mapboxTokenEqual &&
    mapboxMapIdEqual &&
    responseEqual &&
    searchAddressEqual &&
    groupedEntitiesEqual &&
    meansEqual &&
    mapZoomLevelEqual &&
    highlightIdEqual &&
    routesEqual &&
    transitRoutesEqual &&
    configEqual &&
    hideIsochronesEqual &&
    gotoMapCenterEqual &&
    isTrialEqual &&
    mapPoiIconsEqual
  );
};

const Map = forwardRef<ICurrentMapRef, IMapProps>(
  (
    {
      mapboxAccessToken,
      mapboxMapId,
      searchResponse,
      searchAddress,
      groupedEntities,
      means,
      mapCenter,
      mapZoomLevel = defaultMapZoom,
      leafletMapId = "mymap",
      highlightId,
      setHighlightId,
      routes,
      transitRoutes,
      mapDisplayMode,
      config,
      onPoiAdd,
      hideEntity,
      setMapCenterZoom,
      addMapClipping,
      directLink,
      hideIsochrones,
      setHideIsochrones,
      toggleSatelliteMapMode,
      isShownPreferredLocationsModal,
      togglePreferredLocationsModal,
      gotoMapCenter,
      setGotoMapCenter,
      isTrial,
      mapPoiIcons,
      isIntegration,
      allowedCountries,
    },
    parentMapRef
  ) => {
    // TODO Further refactoring is required with the usage of react-leaflet library
    // TODO Check all stringified and not stringified dependencies of useEffect hooks
    const { t } = useTranslation();

    const mapRef = useRef<L.Map | null>(null);
    useImperativeHandle(parentMapRef, () => ({
      getZoom: () => mapRef.current?.getZoom(),
      getCenter: () => {
        const mapCenter = mapRef.current?.getCenter();

        return mapCenter
          ? { lat: mapCenter.lat, lng: mapCenter.lng }
          : undefined;
      },
      handleScrollWheelZoom: {
        isScrollWheelZoomEnabled: () =>
          !!mapRef.current?.scrollWheelZoom.enabled(),
        enableScrollWheelZoom: () => {
          mapRef.current?.scrollWheelZoom.enable();
        },
        disableScrollWheelZoom: () => {
          mapRef.current?.scrollWheelZoom.disable();
        },
      },
      handleDragging: {
        isDraggingEnabled: () =>
          !!(L.Browser.mobile && mapRef.current?.dragging.enabled()),
        enableDragging: () =>
          L.Browser.mobile && mapRef.current?.dragging.enable(),
        disableDragging: () =>
          L.Browser.mobile && mapRef.current?.dragging.disable(),
      },
    }));

    const [addPoiModalOpen, setAddPoiModalOpen] = useState(false);
    const [addPoiCoordinates, setAddPoiCoordinates] = useState<
      ApiCoordinates | undefined
    >();
    const [addPoiAddress, setAddPoiAddress] = useState<any>();
    const [fullscreen, setFullscreen] = useState(false);
    const [mapIconMarker, setMapIconMarker] = useState<L.Marker>();
    const [mapIconRatio, setMapIconRatio] = useState<number>();
    const [poiIconSize, setPoiIconSize] = useState(
      config?.iconSizes?.poiIconSize
    );

    const addPoiModalOpenConfig: ModalConfig = {
      modalTitle: t(IntlKeys.snapshotEditor.addNewLocationModalTitle),
      submitButtonTitle: t(IntlKeys.snapshotEditor.addNewLocationModalBtn),
      modalOpen: addPoiModalOpen,
      postSubmit: () => {
        setAddPoiModalOpen(false);
      },
    };

    const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;
    const isEmbedMode = mapDisplayMode === MapDisplayModesEnum.EMBEDDED;
    const resultMapIcon = isIntegration ? intMyLocationIcon : myLocationIcon;

    const escFunction = useCallback(
      (e) => {
        if (e.key !== "Escape") {
          return;
        }

        if (currentMap && fullscreen) {
          setFullscreen(false);

          setTimeout(() => {
            currentMap!.invalidateSize();
          }, 400);
        }
      },
      [fullscreen]
    );

    useEffect(() => {
      document.addEventListener("keydown", escFunction, false);

      return () => {
        document.removeEventListener("keydown", escFunction, false);
      };
    }, [escFunction]);

    useEffect(() => {
      document.body.classList.toggle("fullscreen", fullscreen);
    }, [fullscreen]);

    const initialMapCenter = searchResponse.centerOfInterest.coordinates;

    // draw the map (main component)
    useEffect(() => {
      const attribution =
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

      const attributionEmbedded =
        'Powered by &copy; <a href="https://areabutler.de" target="_blank">AreaButler</a>, ' +
        attribution;

      const url = isEmbedMode
        ? `${process.env.REACT_APP_BASE_URL || ""
        }/api/location/tiles/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token={accessToken}`
        : "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token={accessToken}";

      if (currentMap !== undefined) {
        currentMap.off();
        currentMap.remove();
      }

      // LEFT JUST IN CASE - the old touch screen solution
      // L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

      const mapOptions: L.MapOptions & {
        gestureHandling?: boolean;
        gestureHandlingOptions?: { duration: number };
      } = {
        preferCanvas: true,
        renderer: new L.Canvas(),
        dragging: !L.Browser.mobile,
        touchZoom: true,
        maxZoom: 20,
        // Adds zoom in / zoom out buttons
        zoomControl: false,
        // LEFT JUST IN CASE - the old touch screen solution
        // gestureHandling: L.Browser.mobile,
        // gestureHandlingOptions: {
        //   duration: 1,
        // },
        // Controls zoom buttons' zoom rate. Default values - 1, smaller values for zoomDelta - smaller steps.
        zoomSnap: 0,
        zoomDelta: 0.25,
        // Controls mouse wheel zoom rate. Default value - 60, higher values - smaller steps.
        wheelPxPerZoomLevel: 60,
        scrollWheelZoom: isEditorMode,
      };

      const localMap = L.map(leafletMapId, mapOptions).setView(
        mapCenter,
        mapZoomLevel
      );

      const zoomControl = L.control.zoom({ position: "bottomleft" });
      zoomControl.addTo(localMap);

      localMap.on("zoomend", () => {
        if (!config) {
          return;
        }
        
        if (!config.groupItems) {
          const container = document.querySelector(".leaflet-container");

          if (localMap.getZoom() < 15) {
            container?.classList.add("no-group");
          } else {
            container?.classList.remove("no-group");
          }

          if (localMap.getZoom() < 13) {
            container?.classList.add("small-markers");
          } else {
            container?.classList.remove("small-markers");
          }
          
          checkUserZoomLevel();
        }
      });

      if (onPoiAdd) {
        localMap.on("contextmenu", async (e: any): Promise<void> => {
          const coordinates: ApiCoordinates = e.latlng;

          const place = (await deriveAddressFromCoordinates({
            coordinates,
            allowedCountries,
          })) || {
            label: "Mein Standort",
            value: { place_id: "123" },
          };

          setAddPoiCoordinates(coordinates);
          setAddPoiAddress(place);
          setAddPoiModalOpen(true);
        });
      }

      L.tileLayer(url, {
        attribution: isEmbedMode ? attributionEmbedded : attribution,
        id: mapboxMapId,
        zoomOffset: -1,
        accessToken: mapboxAccessToken,
        tileSize: 512,
        maxZoom: 20,
      }).addTo(localMap);

      currentMap = localMap;
      mapRef.current = currentMap;

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      isEmbedMode,
      initialMapCenter,
      leafletMapId,
      mapboxAccessToken,
      mapboxMapId,
      searchAddress,
      config?.groupItems,
      config?.mapIcon,
      config?.showAddress,
      config?.showLocation,
    ]);

    const checkUserZoomLevel = useCallback(() => {
      if (!currentMap) {
        return;
      }
      
      const poiMarkers = amenityMarkerGroup.getLayers() as IdMarker[];
      const userZoomLevel = config?.zoomLevel ?? 16;

      poiMarkers.forEach((marker) => {
        if (currentMap!.getZoom() <= userZoomLevel) {
          marker.getElement()?.classList.add('dot-marker-shown');
        } else {
          marker.getElement()?.classList.remove("dot-marker-shown");
        }
      });
    }, [config?.zoomLevel]);
    
    useEffect(() => {
      checkUserZoomLevel();
    }, [checkUserZoomLevel]);
    
    // draw trial logos
    useEffect(() => {
      if (!currentMap || !isTrial) {
        return;
      }

      let image = `<img src="${areaButlerLogo}" style="width: auto; height: 7vh; opacity: 0.3; transform: rotate(45deg); filter: grayscale(1);" alt="watermark">`;

      if (
        mapboxMapId ===
        defaultMapboxStyles.find(
          ({ label }) => label === MapboxStyleLabelsEnum.SATELLITE
        )?.key
      ) {
        image = `<img src="${areaButlerWhiteTextLogo}" style="width: auto; height: 7vh; opacity: 0.8; transform: rotate(45deg)" alt="watermark">`;
      }

      // @ts-ignore
      L.GridLayer.DebugCoords = L.GridLayer.extend({
        createTile(coords: L.Point) {
          const tile = document.createElement("div");
          tile.innerHTML = image;

          return tile;
        },
      });

      // @ts-ignore
      currentMap.addLayer(
        // @ts-ignore
        new L.GridLayer.DebugCoords({ tileSize: 256 }).setZIndex(2)
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      initialMapCenter,
      isEmbedMode,
      isTrial,
      leafletMapId,
      mapboxAccessToken,
      mapboxMapId,
      searchAddress,
      config?.groupItems,
      config?.mapIcon,
      config?.showAddress,
      config?.showLocation,
    ]);

    // draw map icon (my location)
    useEffect(() => {
      if (!currentMap || (!config?.showAddress && !config?.showLocation)) {
        return;
      }

      const drawMapIcon = async (): Promise<void> => {
        if (mapIconMarker) {
          mapIconMarker.remove();
        }

        const mapIconImage = new Image();
        mapIconImage.src = config?.mapIcon ?? resultMapIcon;
        await mapIconImage.decode();
        const mapIconImageRatio =
          Math.round((mapIconImage.width / mapIconImage.height) * 10) / 10;
        setMapIconRatio(mapIconImageRatio);

        const resultingSize =
          config?.iconSizes?.mapIconSize || defaultMyLocationIconSize;

        let html = `<img src="${resultMapIcon}" alt="marker-icon-address" style="width: auto; height: ${resultingSize}px;" />`;
        if (config?.mapIcon) {
          html = `<img src="${config.mapIcon}" alt="marker-icon-address" style="width: auto; height: ${resultingSize}px;" />`;
        } else if (config.primaryColor) {
          html = renderToStaticMarkup(
            <DefaultMarker
              style={{ width: "100%", height: resultingSize }}
              fill={config.primaryColor}
            />
          );
        }

        const myLocationLeafletIcon = L.divIcon({
          iconUrl: config?.mapIcon ?? resultMapIcon,
          shadowUrl: leafletShadow,
          shadowSize: [0, 0],
          iconSize: new L.Point(
            resultingSize * mapIconImageRatio,
            resultingSize
          ),
          className: "map-icon-wrapper",
          html,
        });

        const { lat, lng } = config.showAddress
          ? searchResponse.centerOfInterest.coordinates
          : randomizeCoordinates(searchResponse.centerOfInterest.coordinates);

        const myLocationMarker = L.marker([lat, lng], {
          icon: myLocationLeafletIcon,
          zIndexOffset: 3000,
        }).addTo(currentMap!);

        setMapIconMarker(myLocationMarker);

        if (config?.showAddress || !isEmbedMode) {
          let detailContent = `${searchAddress}`;

          if (config?.showStreetViewLink || !isEmbedMode) {
            const googleStreetViewUrl = `https://www.google.com/maps?q&layer=c&cbll=${mapCenter.lat},${mapCenter.lng}&cbp=11,0,0,0,0`;

            const streetViewContent = `
            <br/><br/>
            <a href="${googleStreetViewUrl}" target="_blank" class="flex gap-2">
              <img class="w-4 h-4" src=${googleIcon} alt="icon" />
               <span>Street View</span>
            </a>
          `;

            detailContent = `${detailContent}${streetViewContent}`;
          }

          myLocationMarker.on("click", (event) => {
            const marker = event.target;
            marker.unbindPopup();
            marker.bindPopup(detailContent);
            marker.openPopup();
          });
        }
      };

      void drawMapIcon();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      isEmbedMode,
      mapboxMapId,
      mapCenter.lat,
      mapCenter.lng,
      searchAddress,
      searchResponse.centerOfInterest.coordinates,
      config?.groupItems,
      config?.mapIcon,
      config?.showAddress,
      config?.primaryColor,
      config?.showLocation,
      config?.showStreetViewLink,
    ]);

    const meansStringified = JSON.stringify(means);

    // draw means of transportation
    useEffect(() => {
      const parsedMeans = JSON.parse(meansStringified);

      if (!currentMap) {
        return;
      }

      if (meansGroup) {
        currentMap.removeLayer(meansGroup);
      }

      if (hideIsochrones) {
        return;
      }

      meansGroup = L.layerGroup();
      currentMap.addLayer(meansGroup);

      const derivePositionForTransportationMean = (
        profile: MeansOfTransportation
      ) => {
        return searchResponse.routingProfiles[
          profile
        ]?.isochrone.features[0].geometry.coordinates[0].map(
          (item: number[]) => {
            return [item[1], item[0]];
          }
        );
      };

      if (parsedMeans.byFoot) {
        const position = derivePositionForTransportationMean(
          MeansOfTransportation.WALK
        );

        if (position) {
          L.polygon(position, {
            color: WALK_COLOR,
            opacity: 0.7,
            fillOpacity: 0.0,
          }).addTo(meansGroup);
        }
      }

      if (parsedMeans.byBike) {
        const position = derivePositionForTransportationMean(
          MeansOfTransportation.BICYCLE
        );

        if (position) {
          L.polygon(position, {
            color: BICYCLE_COLOR,
            opacity: 0.7,
            fillOpacity: 0.0,
          }).addTo(meansGroup);
        }
      }

      if (parsedMeans.byCar) {
        const position = derivePositionForTransportationMean(
          MeansOfTransportation.CAR
        );

        if (position) {
          L.polygon(position, {
            color: CAR_COLOR,
            opacity: 0.7,
            fillOpacity: 0.0,
          }).addTo(meansGroup);
        }
      }
    }, [
      hideIsochrones,
      mapboxMapId,
      meansStringified,
      searchResponse.routingProfiles,
      config?.groupItems,
      config?.hideIsochrones,
      config?.mapIcon,
      config?.showAddress,
      config?.showLocation,
    ]);

    // draw routes
    useEffect(() => {
      const activeEntities = groupedEntities
        ?.filter((ge) => ge.active)
        .flatMap((value) => value.items);

      const getIcon = (m: MeansOfTransportation | string) => {
        switch (m) {
          case MeansOfTransportation.CAR:
            return carIcon;
          case MeansOfTransportation.BICYCLE:
            return bikeIcon;
          case MeansOfTransportation.WALK:
            return walkIcon;
          case "pedestrian":
            return walkIcon;
          case "bus":
            return busStopIcon;
          default:
            return stationIcon;
        }
      };

      const getDashArray = (transportMode: string) => {
        switch (transportMode) {
          case "pedestrian":
            return "8";
          default:
            return "0";
        }
      };

      const isVisibleDestination = (r: ApiRoute | ApiTransitRoute) =>
        !!activeEntities.find(
          (value) =>
            value.coordinates.lat === r.destination.lat &&
            value.coordinates.lng === r.destination.lng
        );

      if (!currentMap) {
        return;
      }

      if (routesGroup) {
        currentMap.removeLayer(routesGroup);
      }

      routesGroup = L.layerGroup();
      currentMap.addLayer(routesGroup);

      routes
        .filter((e) => e.show.length > 0)
        .forEach((entityRoute) => {
          entityRoute.routes
            .filter((r) => entityRoute.show.includes(r.meansOfTransportation))
            .filter(isVisibleDestination)
            .forEach((r) => {
              r.sections.forEach((s) => {
                const durationInMinutes = r.sections
                  .map((s) => s.duration)
                  .reduce((p, c) => p + c);
                const line = L.geoJSON(s.geometry, {
                  style: () => ({
                    color: MEAN_COLORS[r.meansOfTransportation],
                  }),
                })
                  .bindPopup(
                    `<h4 class="font-semibold">Route zu ${entityRoute.title
                    }</h4><br/><div><span class="flex"><img class="w-4 h-4 mr-1" src=${getIcon(
                      r.meansOfTransportation
                    )} alt="icon" /><span>${Number.isNaN(durationInMinutes)
                      ? durationInMinutes
                      : timeToHumanReadable(durationInMinutes)
                    }</span></span></div>`
                  )
                  .addTo(routesGroup);
                // @ts-ignore
                L.path.touchHelper(line).addTo(routesGroup);
              });
            });
        });

      transitRoutes
        .filter((e) => e.show)
        .forEach((entityRoute) => {
          const { route } = entityRoute;

          if (isVisibleDestination(route)) {
            const popupContent = route.sections
              .map(
                (s) =>
                  `<span class="flex"><img class="w-4 h-4 mr-1" src=${getIcon(
                    s.transportMode
                  )} alt="icon"/><span>${Number.isNaN(s.duration)
                    ? s.duration
                    : timeToHumanReadable(s.duration)
                  }</span></span>`
              )
              .join("➟");

            const fullDuration = route.sections
              .map((s) => s.duration)
              .reduce((p, c) => p + c);

            route.sections.forEach((s) => {
              const line = L.geoJSON(s.geometry, {
                style: () => ({
                  color: "#fcba03",
                  dashArray: getDashArray(s.transportMode),
                }),
              })
                .bindPopup(
                  `<h4 class="font-semibold">ÖPNV Route zu ${entityRoute.title
                  } (${Number.isNaN(fullDuration)
                    ? fullDuration
                    : timeToHumanReadable(fullDuration)
                  })</h4><br/><div class="flex flex-wrap items-center gap-2">${popupContent}</div>`
                )
                .addTo(routesGroup);

              // @ts-ignore
              L.path.touchHelper(line).addTo(routesGroup);
            });
          }
        });
    }, [
      groupedEntities,
      mapboxMapId,
      meansStringified,
      routes,
      transitRoutes,
      config?.mapIcon,
    ]);

    const entitiesStringified = JSON.stringify(
      groupedEntities.flatMap((g) => g.items)
    );

    const groupedEntitiesStringified = JSON.stringify(groupedEntities);

    const drawAmenityMarkers = () => {
      if (!currentMap) {
        return;
      }

      const parsedEntities: ResultEntity[] | null =
        JSON.parse(entitiesStringified);

      let parsedEntityGroups: EntityGroup[] = JSON.parse(
        groupedEntitiesStringified
      );

      currentMap!.removeLayer(amenityMarkerGroup);

      amenityMarkerGroup = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          const groupedMarkers = groupBy(
            cluster.getAllChildMarkers().map((m) => m.getIcon().options),
            (i: any) => i.iconUrl
          );

          const countedMarkers = Object.entries(groupedMarkers)
            .map(([key, value]) => ({
              key,
              icon: (value as any)[0].html,
              count: (value as any).length,
            }))
            .sort((a, b) => b.count - a.count);

          const markerIcons = countedMarkers.map(
            (cm) =>
              '<div class="flex items-center gap-0.5">' +
              cm.icon +
              `<span class="cluster-icon-counter">${cm.count}</span>` +
              "</div>"
          );

          return L.divIcon({
            html:
              '<div class="cluster-icon-wrapper">' +
              markerIcons.join("") +
              "</div>",
            className: "cluster-icon",
          });
        },
        maxClusterRadius: 200,
        polygonOptions: { color: config?.primaryColor || "#fff" },
        disableClusteringAtZoom: config?.groupItems ? 17 : 1,
        spiderfyOnMaxZoom: false,
        animate: true,
        zoomToBoundsOnClick: true,
      });

      // set realEstateListing to active if theme is KF and group is real estate listings
      // if (config?.theme === "KF") {
      //   parsedEntityGroups = parsedEntityGroups.map((peg) => ({
      //     ...peg,
      //     active:
      //       config.theme === "KF" && peg.title === realEstateListingsTitle
      //         ? true
      //         : peg.active,
      //   }));
      // }

      // Add each POI to the marker cluster group
      parsedEntities?.every((entity) => {
        if (
          !parsedEntityGroups.some(
            ({ active, name }) =>
              osmEntityMapper.getGrpNameByOsmName(entity.osmName) === name &&
              active
          )
        ) {
          return true;
        }

        const isRealEstateListing = entity.osmName === OsmName.property;
        const isPreferredLocation = entity.osmName === OsmName.favorite;

        if (
          config?.hidePoiIcons &&
          !isRealEstateListing &&
          !isPreferredLocation
        ) {
          return true;
        }

        let markerIcon!: IPoiIcon;

        if (isRealEstateListing) {
          markerIcon = config?.mapIcon
            ? {
              icon: config?.mapIcon,
              color:
                config.primaryColor ?? getRealEstateListingsIcon().color,
              isCustom: true,
            }
            : getRealEstateListingsIcon(mapPoiIcons);
        }

        if (isPreferredLocation) {
          markerIcon = getPreferredLocationsIcon(mapPoiIcons);
        }

        if (!markerIcon) {
          markerIcon = deriveIconForPoiGroup(
            osmEntityMapper.getGrpNameByOsmName(entity.osmName),
            mapPoiIcons
          );
        }

        const resultingIconSize =
          config?.iconSizes?.poiIconSize || defaultAmenityIconSize;
        const leafletIconSize = new L.Point(
          resultingIconSize,
          resultingIconSize
        );

        const resultingIconStyleSize =
          ((config?.mapIcon || config?.primaryColor) &&
            isRealEstateListing) ||
            markerIcon.isCustom
            ? resultingIconSize
            : Math.floor(resultingIconSize / 2);
        const iconStyle = `width: auto; height: ${resultingIconStyleSize}px;`;
        const backColorClass = entity.isFiltered
          ? "bg-gray-200"
          : markerIcon.isCustom
            ? "bg-transparent"
            : "bg-white";

        let html = `<div class="locality-marker ${backColorClass}" style="border-color: ${markerIcon.color
          };${entity.isFiltered ? "filter: brightness(75%) grayscale(100%);" : ""
          }"><img src="${markerIcon.icon}" alt="marker-icon" class="${entity.osmName
          } locality-icon" style="${iconStyle}" /></div>`;

        if ((config?.mapIcon && isRealEstateListing) || markerIcon.isCustom) {
          html = `<div class="locality-marker-custom" style="border-color: ${markerIcon.color
            }"><img src="${markerIcon.icon
            }" alt="marker-icon-custom" class="${entity.osmName
            } locality-icon-custom ${backColorClass}" style="${iconStyle}${entity.isFiltered
              ? "filter: brightness(75%) grayscale(100%);"
              : ""
            }" /></div>`;
        } else if (config?.primaryColor && isRealEstateListing) {
          html = `<div class="locality-marker-custom" style="border-color: ${markerIcon.color
            }">` + renderToStaticMarkup(
            <DefaultMarker
              fill={config.primaryColor}
              className="locality-icon-custom"
              style={{
                width: "auto",
                height: resultingIconStyleSize,
                filter: entity.isFiltered
                  ? "brightness(75%) grayscale(100%)"
                  : "",
                borderColor: markerIcon.color,
              }}
            />
          ) + '</div>';
        }
                   
        const icon = L.divIcon({
          iconUrl: markerIcon.icon,
          shadowUrl: leafletShadow,
          shadowSize: [0, 0],
          iconSize: leafletIconSize,
          className: `locality-marker-wrapper ${(isRealEstateListing && config?.mapIcon) || markerIcon.isCustom
              ? "locality-marker-wrapper-custom"
              : ""
            } icon-${entity.osmName}`,
          html,
        });

        const marker = new IdMarker({
          config,
          entity,
          searchAddress,
          hideEntity: isEditorMode ? hideEntity : undefined,
          latLng: entity.coordinates,
          options: {
            icon,
          },
        }).on("click", (e) => {
          const marker = e.target;
          marker.createOpenPopup();          
        });

        amenityMarkerGroup.addLayer(marker);

        return true;
      });

      currentMap!.addLayer(amenityMarkerGroup);
    };

    // draw POIs (amenities)
    useEffect(() => {
      void drawAmenityMarkers();

      // config?.showLocation and config?.showAddress are required for the "Objekt anzeigen" and "Adresse anzeigen" checkboxes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      entitiesStringified,
      groupedEntitiesStringified,
      mapboxMapId,
      config?.groupItems,
      config?.mapIcon,
      config?.showAddress,
      config?.showLocation,
    ]);

    // change icon sizes
    useEffect(() => {
      if (
        !currentMap ||
        !amenityMarkerGroup ||
        !mapIconMarker ||
        !mapIconRatio ||
        !config?.iconSizes
      ) {
        return;
      }

      const mapIcon: L.DivIcon = mapIconMarker.getIcon();
      const mapIconHtml = mapIcon.options.html as string;
      const resultingMapIconSize: number =
        config?.iconSizes?.mapIconSize || defaultMyLocationIconSize;

      mapIcon.options.html = mapIconHtml.replace(
        /^(.*style=")[^<]*(".*)$/,
        `$1width: ${resultingMapIconSize * mapIconRatio
        }px; height: ${resultingMapIconSize}px;$2`
      );

      mapIcon.options.iconSize = new L.Point(
        resultingMapIconSize * mapIconRatio,
        resultingMapIconSize
      );

      mapIconMarker.setIcon(mapIcon);

      // to prevent unnecessary computations
      if (config?.iconSizes?.poiIconSize === poiIconSize) {
        return;
      }

      setPoiIconSize(config?.iconSizes?.poiIconSize);
      const poiMarkers = amenityMarkerGroup.getLayers() as IdMarker[];

      poiMarkers.forEach((marker) => {
        const icon: L.DivIcon = marker.getIcon();
        const iconHtml = icon.options.html as string;

        const resultingSize: number = iconHtml.match(/^.*locality-icon[^-].*$/)
          ?.length
          ? Math.floor(config?.iconSizes?.poiIconSize! / 2)
          : config?.iconSizes?.poiIconSize!;

        icon.options.html = iconHtml.replace(
          /^(.*locality-icon.*style=")[^<]*(".*)$/,
          `$1width: ${resultingSize}px; height: ${resultingSize}px;$2`
        );

        icon.options.iconSize = new L.Point(
          config?.iconSizes?.poiIconSize!,
          config?.iconSizes?.poiIconSize!
        );

        marker.setIcon(icon);
      });
    }, [config?.iconSizes, mapIconMarker, mapIconRatio, poiIconSize]);

    // react to the POI item clicking in the 'Localities' map menu
    useEffect(() => {
      if (!highlightId) {
        return;
      }

      const poiMarkers = amenityMarkerGroup.getLayers() as IdMarker[];
      const highlightMarker = poiMarkers.find(
        (marker) => marker.getEntity().id === highlightId
      );

      if (highlightMarker) {
        // 'setTimeout' is used to wait for de-spider animation of the marker groups
        setTimeout(() => {
          highlightMarker.createOpenPopup();
          setHighlightId();
        }, 1200);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId]);

    // change map zoom level and center coordinates
    useEffect(() => {
      if (!currentMap || !gotoMapCenter) {
        return;
      }

      const setViewArguments: [
        centerCoordinates: ApiCoordinates,
        zoomLevel?: number
      ] = [mapCenter];

      if (gotoMapCenter?.withZoom) {
        setViewArguments.push(mapZoomLevel);
      }

      currentMap.setView(...setViewArguments);
      setGotoMapCenter(undefined);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gotoMapCenter]);

    const takeScreenshot = async (): Promise<void> => {
      if (isShownPreferredLocationsModal) {
        togglePreferredLocationsModal(false);
      }

      const mapMenuContainer = document.querySelector(
        ".map-menu.map-menu-open"
      ) as HTMLElement;
      if (mapMenuContainer) {
        mapMenuContainer.style.transition = "none";
        mapMenuContainer.className = mapMenuContainer.className
          .replace("map-menu-open", "")
          .trim();
      }

      const mapMenuBtnContainer = document.querySelector(
        ".show-menu-btn.map-menu-btn"
      ) as HTMLElement;
      if (mapMenuBtnContainer) {
        mapMenuBtnContainer.style.display = "none";
      }

      const kfMapMenuContainer = document.querySelector(
        ".map-menu-KF"
      ) as HTMLElement;
      if (kfMapMenuContainer) {
        kfMapMenuContainer.style.display = "none";
      }

      const meansContainer = document.querySelector(
        ".map-nav-bar-container"
      ) as HTMLElement;
      if (meansContainer) {
        meansContainer.style.display = "none";
      }

      const poiSearchContainer = document.querySelector(
        `#${poiSearchContainerId}`
      );
      if (poiSearchContainer) {
        poiSearchContainer.className = `${poiSearchContainer.className} hidden`;
      }

      const bottomElements = document.querySelectorAll(".leaflet-bottom");
      for (let i = 0; i < bottomElements.length; i++) {
        bottomElements[i].className = `${bottomElements[i].className} hidden`;
      }

      const mapClipping = await toPng(
        document.querySelector(`#${searchResContainId}`) as HTMLElement,
        {
          quality: 1,
          pixelRatio: 2,
          cacheBust: true,
        }
      );

      addMapClipping(mapClipping);

      if (isShownPreferredLocationsModal) {
        togglePreferredLocationsModal(true);
      }

      if (mapMenuContainer) {
        mapMenuContainer.className = `${mapMenuContainer.className} map-menu-open`;
        mapMenuContainer.style.transition = "width 0.2s";
      }

      if (mapMenuBtnContainer) {
        mapMenuBtnContainer.style.display = "";
      }

      if (kfMapMenuContainer) {
        kfMapMenuContainer.style.display = "";
      }

      if (meansContainer) {
        meansContainer.style.display = "";
      }

      if (poiSearchContainer) {
        poiSearchContainer.className = poiSearchContainer.className.replace(
          " hidden",
          ""
        );
      }

      for (let i = 0; i < bottomElements.length; i++) {
        bottomElements[i].className = bottomElements[i].className.replace(
          " hidden",
          ""
        );
      }
    };

    const toggleFullscreen = (): void => {
      setFullscreen(!fullscreen);

      if (currentMap) {
        setTimeout(() => {
          currentMap!.invalidateSize();
        }, 400);
      }
    };

    const zoomToMeanBounds = (mean: MeansOfTransportation): void => {
      if (!currentMap) {
        return;
      }

      const derivePolygonForMean = (mean: MeansOfTransportation): L.Polygon => {
        const derivePositionForTransportationMean = (
          profile: MeansOfTransportation
        ) => {
          return searchResponse.routingProfiles[
            profile
          ]?.isochrone.features[0].geometry.coordinates[0].map(
            (item: number[]) => {
              return [item[1], item[0]];
            }
          );
        };

        switch (mean) {
          case MeansOfTransportation.WALK: {
            return L.polygon(
              derivePositionForTransportationMean(MeansOfTransportation.WALK),
              {
                color: WALK_COLOR,
                opacity: 0.7,
                fillOpacity: 0.0,
              }
            );
          }

          case MeansOfTransportation.BICYCLE: {
            return L.polygon(
              derivePositionForTransportationMean(
                MeansOfTransportation.BICYCLE
              ),
              {
                color: BICYCLE_COLOR,
                opacity: 0.7,
                fillOpacity: 0.0,
              }
            );
          }

          case MeansOfTransportation.CAR: {
            return L.polygon(
              derivePositionForTransportationMean(MeansOfTransportation.CAR),
              {
                color: CAR_COLOR,
                opacity: 0.7,
                fillOpacity: 0.0,
              }
            );
          }
        }
      };

      const polygon = derivePolygonForMean(mean);

      currentMap!.fitBounds(polygon.getBounds(), {
        padding: L.point(10, 10),
        animate: true,
      });
    };

    return (
      <div
        className={`leaflet-container leaflet-container-${config?.theme} w-full`}
        id={leafletMapId}
        data-tour="map"
      >
        {onPoiAdd && (
          <FormModal modalConfig={addPoiModalOpenConfig}>
            <AddPoiFormHandler
              centerCoordinates={mapCenter}
              coordinates={addPoiCoordinates}
              address={addPoiAddress}
              onPoiAdd={onPoiAdd}
            />
          </FormModal>
        )}

        <div className="leaflet-bottom leaflet-left mb-20 cursor-pointer">
          <div
            data-tour="zoom-to-bounds"
            className="leaflet-control-zoom leaflet-bar leaflet-control"
          >
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              data-tour="toggle-bounds"
              className="leaflet-control-zoom-in cursor-pointer p-2"
              role="button"
              onClick={() => {
                setHideIsochrones(!hideIsochrones);
              }}
            >
              <img src={eyeIcon} alt="toggle isochrones" />
            </a>

            {means.byFoot && (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                data-tour="show-foot-bounds"
                className="leaflet-control-zoom-in cursor-pointer p-2"
                role="button"
                onClick={() => {
                  zoomToMeanBounds(MeansOfTransportation.WALK);
                }}
              >
                <img src={walkIcon} alt="zoom to walk" />
              </a>
            )}

            {means.byBike && (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                data-tour="show-bike-bounds"
                className="leaflet-control-zoom-in cursor-pointer p-2"
                role="button"
                onClick={() => {
                  zoomToMeanBounds(MeansOfTransportation.BICYCLE);
                }}
              >
                <img src={bikeIcon} alt="zoom to bicycle" />
              </a>
            )}

            {means.byCar && (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                data-tour="show-car-bounds"
                className="leaflet-control-zoom-in cursor-pointer p-2"
                role="button"
                onClick={() => {
                  zoomToMeanBounds(MeansOfTransportation.CAR);
                }}
              >
                <img src={carIcon} alt="zoom to car" />
              </a>
            )}
          </div>

          <div className={`leaflet-control-zoom leaflet-bar leaflet-control`}>
            {!isIntegration &&
              (!isEmbedMode ? (
                <a
                  href="/"
                  data-tour="go-fullscreen"
                  className="leaflet-control-zoom-in cursor-pointer"
                  role="button"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleFullscreen();
                  }}
                >
                  <svg
                    height="100%"
                    version="1.1"
                    viewBox="0 0 36 36"
                    width="100%"
                  >
                    <path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z" />
                    <path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z" />
                    <path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z" />
                    <path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z" />
                  </svg>
                </a>
              ) : (
                <a
                  href={directLink}
                  target="_blank"
                  rel="noreferrer"
                  className="leaflet-control-zoom-in cursor-pointer"
                  role="button"
                >
                  <svg
                    height="100%"
                    version="1.1"
                    viewBox="0 0 36 36"
                    width="100%"
                  >
                    <path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z" />
                    <path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z" />
                    <path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z" />
                    <path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z" />
                  </svg>
                </a>
              ))}

            <a
              href="/"
              className="leaflet-control-zoom-in cursor-pointer"
              role="button"
              onClick={(event) => {
                event.preventDefault();

                setMapCenterZoom(
                  currentMap?.getCenter() || mapCenter,
                  currentMap?.getZoom() || defaultMapZoom
                );

                setGotoMapCenter({ goto: true, withZoom: true });
                toggleSatelliteMapMode();
              }}
            >
              <img src={satelliteIcon} alt="" />
            </a>

            {(!isEmbedMode || isEditorMode) && (
              <a
                href="/"
                data-tour="take-map-picture"
                className="leaflet-control-zoom-in cursor-pointer take-screenshot"
                role="button"
                onClick={(event) => {
                  event.preventDefault();
                  void takeScreenshot();
                }}
                style={{
                  backgroundColor: "white",
                }}
              >
                📷
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// DO NOT USE CHANGEABLE CONTEXT IN MEMOIZED COMPONENT TO PREVENT UNNECESSARY UPDATES
export default memo<IMapMemoProps>(Map, isMapPropsEqual);

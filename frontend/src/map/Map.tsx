import center from "@turf/center";
import {
  Poi,
  SearchContextActions,
  SearchContextActionTypes
} from "context/SearchContext";
import html2canvas from "html2canvas";
import * as L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import leafletShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useState } from "react";
import {
  ApiRoute,
  ApiTransitRoute,
  EntityRoute,
  EntityTransitRoute
} from "../../../shared/types/routing";
import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation,
  OsmName
} from "../../../shared/types/types";
import { groupBy } from "../../../shared/functions/shared.functions";
import mylocationIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import busIcon from "../assets/icons/icons-20-x-20-outline-ic-bus.svg";
import trainIcon from "../assets/icons/icons-20-x-20-outline-ic-train.svg";
import bikeIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import googleIcon from "../assets/icons/google.svg";
import { EntityGroup, ResultEntity } from "../components/SearchResultContainer";
import {
  deriveAddressFromCoordinates,
  deriveIconForOsmName,
  deriveMinutesFromMeters,
  preferredLocationsIcon,
  realEstateListingsIcon,
  realEstateListingsTitle,
  timeToHumanReadable,
  toastSuccess
} from "../shared/shared.functions";
import "./Map.scss";
import "leaflet-touch-helper";
import { osmEntityTypes } from "../../../shared/constants/constants";
import FormModal, { ModalConfig } from "components/FormModal";
import AddPoiFormHandler from "./AddPoiFormHandler";
import { allRealEstateCostTypes } from "../../../shared/constants/real-estate";

export interface MapProps {
  mapBoxAccessToken: string;
  searchContextDispatch: (action: SearchContextActions) => void;
  searchResponse: ApiSearchResponse;
  searchAddress: string;
  entities: ResultEntity[] | null;
  groupedEntities: EntityGroup[];
  mapCenter?: ApiCoordinates;
  mapZoomLevel?: number;
  leafletMapId?: string;
  mapboxMapId?: string;
  means: {
    byFoot: boolean;
    byBike: boolean;
    byCar: boolean;
  };
  highlightId?: string | null | undefined;
  routes: EntityRoute[];
  transitRoutes: EntityTransitRoute[];
  embedMode?: boolean;
  config?: ApiSearchResultSnapshotConfig;
  onPoiAdd?: (poi: Poi) => void;
}

export class IdMarker extends L.Marker {
  entity: ResultEntity;
  searchAddress: string;

  constructor(
    latLng: L.LatLngExpression,
    entity: ResultEntity,
    searchAddress: string,
    options?: L.MarkerOptions
  ) {
    super(latLng, options);
    this.entity = entity;
    this.searchAddress = searchAddress;
  }

  getEntity() {
    return this.entity;
  }

  setEntity(entity: ResultEntity) {
    this.entity = entity;
  }

  createOpenPopup() {
    this.unbindPopup();
    if (!this.getPopup()) {
      const entityTitle = this.entity.name || this.entity.label;
      const street =
        this.entity.address.street && this.entity.address.street !== "undefined"
          ? this.entity.address.street
          : null;

      let cityFromSearch = "";
      if (this.searchAddress) {
        const searchAddressParts = this.searchAddress.split(",");
        cityFromSearch = searchAddressParts[searchAddressParts.length - 1];
      }

      const searchString = [
        osmEntityTypes.find(t => t.name === this.entity.type)?.label,
        entityTitle,
        this.entity?.address?.street !== "undefined"
          ? this.entity.address?.street
          : "",
        this.entity?.address?.city
          ? this.entity?.address?.city
          : cityFromSearch.trim()
      ].join(" ");
      const title =
        this.entity.type !== "property"
          ? `<h4><a target="_blank" href="https://google.de/search?q=${encodeURIComponent(
              searchString
            )}"><span class="flex"><img class="w-4 h-4 mr-1" src=${googleIcon} alt="icon" />Mehr Informationen</a></h4>`
          : `${entityTitle}`;
      const isRealEstateListing = this.entity.type === "property";
      const isPreferredLocation = this.entity.type === "favorite";
      const isRealEstateListingOrPreferredAdress =
        isPreferredLocation || isRealEstateListing;
      const byFoot = this.entity.byFoot
        ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${walkIcon} alt="icon" /><span>${timeToHumanReadable(
            deriveMinutesFromMeters(
              this.entity.distanceInMeters,
              MeansOfTransportation.WALK
            )
          )}</span></span>`
        : "";
      const byBike = this.entity.byBike
        ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${bikeIcon} alt="icon" /><span>${timeToHumanReadable(
            deriveMinutesFromMeters(
              this.entity.distanceInMeters,
              MeansOfTransportation.BICYCLE
            )
          )}</span></span>`
        : "";
      const byCar = this.entity.byCar
        ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${carIcon} alt="icon" /><span>${timeToHumanReadable(
            deriveMinutesFromMeters(
              this.entity.distanceInMeters,
              MeansOfTransportation.CAR
            )
          )}</span></span>`
        : "";
      if (this.entity.type === "property") {
        const realEstateData = this.entity.realEstateData;
        const realEstateInformationParts = [];

        if (!!realEstateData?.characteristics?.propertySizeInSquareMeters) {
          realEstateInformationParts.push(
            `<span class="font-semibold mt-2">Größe: </span> ${realEstateData?.characteristics?.propertySizeInSquareMeters} &#13217;`
          );
        }

        if (!!this.entity.externalUrl && this.entity.externalUrl.length) {
          realEstateInformationParts.push(
            `<a target="_blank" href="${this.entity.externalUrl}" class="real-estate-cta">Direkt zum Objekt ></a>`
          );
        }

        const realEstateInformation = realEstateInformationParts.join(
          "<br /><br />"
        );

        this.bindPopup(
          `<h4 class="font-semibold text-lg">${title}</h4><br /><br />
          ${realEstateInformation}
          `
        );
      } else {
        this.bindPopup(
          `<span class="font-semibold">${entityTitle}</span><br /><br />
        <span class="font-semibold mt-2">${title}</span><br />${
            street ? "<div>" + street + "</div><br />" : ""
          }<div class="flex gap-6">${
            !isRealEstateListingOrPreferredAdress ? byFoot : ""
          }${!isRealEstateListingOrPreferredAdress ? byBike : ""}${
            !isRealEstateListingOrPreferredAdress ? byCar : ""
          }</div>`
        );
      }
    }
    this.openPopup();
  }
}

export const defaultMapZoom = 15;
const defaultAmenityIconSize = new L.Point(32, 32);
const myLocationIconSize = new L.Point(46, 46);
const customMyLocationIconSize = new L.Point(32, 32);

let zoom = defaultMapZoom;
let currentMap: L.Map | undefined;
let meansGroup = L.layerGroup();
let routesGroup = L.layerGroup();
let amenityMarkerGroup = L.markerClusterGroup();

const areMapPropsEqual = (prevProps: MapProps, nextProps: MapProps) => {
  const mapboxKeyEqual =
    prevProps.mapBoxAccessToken === nextProps.mapBoxAccessToken;
  const responseEqual =
    JSON.stringify(prevProps.searchResponse) ===
    JSON.stringify(nextProps.searchResponse);
  const searchAdressEqual =
    JSON.stringify(prevProps.searchAddress) ===
    JSON.stringify(nextProps.searchAddress);
  const entitiesEqual =
    JSON.stringify(prevProps.entities) === JSON.stringify(nextProps.entities);
  const entityGroupsEqual =
    JSON.stringify(prevProps.groupedEntities) ===
    JSON.stringify(nextProps.groupedEntities);
  const meansEqual =
    JSON.stringify(prevProps.means) === JSON.stringify(nextProps.means);
  const mapCenterEqual =
    JSON.stringify(prevProps.mapCenter) === JSON.stringify(nextProps.mapCenter);
  const mapZoomLevelEqual = prevProps.mapZoomLevel === nextProps.mapZoomLevel;
  const highlightIdEqual = prevProps.highlightId === nextProps.highlightId;
  const routesEqual = prevProps.routes === nextProps.routes;
  const transitRoutesEqual =
    prevProps.transitRoutes === nextProps.transitRoutes;
  const configEqual =
    JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config);
  const mapboxMapIdEqual = prevProps.mapboxMapId === nextProps.mapboxMapId;
  return (
    mapboxKeyEqual &&
    responseEqual &&
    searchAdressEqual &&
    entitiesEqual &&
    entityGroupsEqual &&
    meansEqual &&
    mapCenterEqual &&
    mapZoomLevelEqual &&
    highlightIdEqual &&
    routesEqual &&
    transitRoutesEqual &&
    configEqual &&
    mapboxMapIdEqual
  );
};

const WALK_COLOR = "#c91444";
const BICYCLE_COLOR = "#8f72eb";
const CAR_COLOR = "#1f2937";

const MEAN_COLORS: { [key in keyof typeof MeansOfTransportation]: string } = {
  [MeansOfTransportation.CAR]: CAR_COLOR,
  [MeansOfTransportation.BICYCLE]: BICYCLE_COLOR,
  [MeansOfTransportation.WALK]: WALK_COLOR
};
const Map = React.memo<MapProps>(
  ({
    mapBoxAccessToken,
    searchContextDispatch,
    searchResponse,
    searchAddress,
    entities,
    groupedEntities,
    means,
    mapCenter,
    mapZoomLevel,
    leafletMapId = "mymap",
    highlightId,
    routes,
    transitRoutes,
    embedMode = false,
    config,
    mapboxMapId = "kudiba-tech/ckvu0ltho2j9214p847jp4t4m",
    onPoiAdd
  }) => {
    const [addPoiModalOpen, setAddPoiModalOpen] = useState(false);
    const [addPoiCoordinates, setAddPoiCoordinates] = useState<
      ApiCoordinates | undefined
    >();
    const [addPoiAddress, setAddPoiAddress] = useState<any>();

    let addPoiModalOpenConfig: ModalConfig = {
      modalTitle: "Neuen Ort hinzufügen",
      submitButtonTitle: "Hinzufügen",
      modalOpen: addPoiModalOpen,
      postSubmit: () => {
        setAddPoiModalOpen(false);
      }
    };

    const { lat, lng } = searchResponse.centerOfInterest.coordinates;

    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
      document.body.classList.toggle("fullscreen", fullscreen);
    }, [fullscreen]);

    // main map draw
    useEffect(() => {
      const attribution =
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
      const attributionEmbedded =
        'Powered by &copy; <a href="https://area-butler.de" target="_blank">AreaButler</a>, ' +
        attribution;
      const url = embedMode
        ? `${process.env.REACT_APP_BASE_URL ||
            ""}/api/location/tiles/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`
        : "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";

      if (currentMap !== undefined) {
        currentMap.off();
        currentMap.remove();
      }
      const initialPosition: L.LatLngExpression = [lat, lng];
      const localMap = L.map(leafletMapId, {
        preferCanvas: true,
        renderer: new L.Canvas(),
        tap: true,
        maxZoom: 18,
        zoomControl: false,
        scrollWheelZoom: !L.Browser.mobile
      } as any).setView(initialPosition, zoom);

      const zoomControl = L.control.zoom({ position: "bottomleft" });
      zoomControl.addTo(localMap);

      localMap.on("zoomend", function() {
        if (config && config.groupItems === false) {
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
        }
      });

      if (!!onPoiAdd) {
        localMap.on("contextmenu", async (e: any) => {
          const coordinates: ApiCoordinates = e.latlng;
          const place = (await deriveAddressFromCoordinates(coordinates)) || {
            label: "Mein Standort",
            value: { place_id: "123" }
          };

          setAddPoiCoordinates(coordinates);
          setAddPoiAddress(place);

          setAddPoiModalOpen(true);
        });
      }

      L.tileLayer(url, {
        attribution: embedMode ? attributionEmbedded : attribution,
        id: mapboxMapId,
        zoomOffset: -1,
        accessToken: mapBoxAccessToken,
        tileSize: 512,
        maxZoom: 18
      }).addTo(localMap);
      if (!embedMode || !!searchAddress) {

        
        const googleStreetViewUrl = `https://www.google.com/maps?q&layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0`


        const detailContent = `${searchAddress} <br/><br/>
                               <a href="${googleStreetViewUrl}" target="_blank" class="flex gap-2">
                                  <img class="w-4 h-4" src=${googleIcon} alt="icon" /> 
                                  <span>Street View</span>
                               </a>`

        const iconStyle = config?.mapIcon ? "height: auto; width: 46px;" : "height: 100%; width: auto;";

        const positionIcon = L.divIcon({
          iconUrl: config?.mapIcon ?? mylocationIcon,
          shadowUrl: leafletShadow,
          shadowSize: [0, 0],
          iconSize: config?.mapIcon ? customMyLocationIconSize : myLocationIconSize,
          className: "my-location-icon-wrapper",
          html: `<img src="${config?.mapIcon ??
            mylocationIcon}" alt="marker-icon" style="${iconStyle}" />`
        });
        L.marker([lat, lng], {
          icon: positionIcon
        })
          .on("click", function(event) {
            const marker = event.target;
            marker.unbindPopup();
            marker.bindPopup(detailContent);
            marker.openPopup();
          })
          .addTo(localMap);
      }
      currentMap = localMap;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      lat,
      lng,
      leafletMapId,
      searchContextDispatch,
      mapBoxAccessToken,
      searchAddress,
      embedMode,
      mapboxMapId,
      config?.mapIcon
    ]);

    // react on zoom and center change
    useEffect(() => {
      if (currentMap && mapCenter && mapZoomLevel) {
        // center and zoom view
        currentMap.setView(mapCenter, mapZoomLevel);
        // handle growing/shrinking of icons based on zoom level
        if (amenityMarkerGroup) {
          const markers = amenityMarkerGroup.getLayers() as IdMarker[];
          if (markers.length) {
            const currentSize = markers[0].getIcon().options.iconSize;
            if ((currentSize as L.Point).x === 20 && mapZoomLevel >= 16) {
              markers.forEach(marker => {
                const icon = marker.getIcon();
                icon.options.iconSize = new L.Point(25, 25);
                marker.setIcon(icon);
              });
            }
            if ((currentSize as L.Point).x === 35 && mapZoomLevel < 16) {
              markers.forEach(marker => {
                const icon = marker.getIcon();
                icon.options.iconSize = defaultAmenityIconSize;
                marker.setIcon(icon);
              });
            }
            const marker = markers.find(m => m.getEntity().id === highlightId);
            if (marker) {
              // use timeout to wait for de-spider animation of cluster
              setTimeout(() => {
                marker.createOpenPopup();
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_HIGHLIGHT_ID,
                  payload: null
                });
              }, 1200);
            }
          }
        }
      }
    }, [mapCenter, mapZoomLevel, highlightId, searchContextDispatch]);

    const meansStringified = JSON.stringify(means);
    // draw means
    useEffect(() => {
      const parsedMeans = JSON.parse(meansStringified);
      if (currentMap) {
        if (meansGroup) {
          currentMap.removeLayer(meansGroup);
        }
        meansGroup = L.layerGroup();
        currentMap.addLayer(meansGroup);
        const derivePositionForTransportationMean = (
          profile: MeansOfTransportation
        ) => {
          return searchResponse.routingProfiles[
            profile
          ].isochrone.features[0].geometry.coordinates[0].map(
            (item: number[]) => {
              return [item[1], item[0]];
            }
          );
        };
        if (parsedMeans.byFoot) {
          L.polygon(
            derivePositionForTransportationMean(MeansOfTransportation.WALK),
            {
              color: WALK_COLOR
            }
          ).addTo(meansGroup);
        }
        if (parsedMeans.byBike) {
          L.polygon(
            derivePositionForTransportationMean(MeansOfTransportation.BICYCLE),
            {
              color: BICYCLE_COLOR
            }
          ).addTo(meansGroup);
        }
        if (parsedMeans.byCar) {
          L.polygon(
            derivePositionForTransportationMean(MeansOfTransportation.CAR),
            {
              color: CAR_COLOR
            }
          ).addTo(meansGroup);
        }
      }
    }, [meansStringified, searchResponse.routingProfiles, config?.mapIcon]);

    // draw routes
    useEffect(() => {
      const activeEntities = groupedEntities
        ?.filter(ge => ge.active)
        .flatMap(value => value.items);
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
            return busIcon;
          default:
            return trainIcon;
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
          value =>
            value.coordinates.lat === r.destination.lat &&
            value.coordinates.lng === r.destination.lng
        );

      if (currentMap) {
        if (routesGroup) {
          currentMap.removeLayer(routesGroup);
        }
        routesGroup = L.layerGroup();
        currentMap.addLayer(routesGroup);
        routes
          .filter(e => e.show.length > 0)
          .forEach(entityRoute => {
            entityRoute.routes
              .filter(r => entityRoute.show.includes(r.meansOfTransportation))
              .filter(isVisibleDestination)
              .forEach(r => {
                r.sections.forEach(s => {
                  const durationInMinutes = r.sections
                    .map(s => s.duration)
                    .reduce((p, c) => p + c);
                  const line = L.geoJSON(s.geometry, {
                    style: function() {
                      return { color: MEAN_COLORS[r.meansOfTransportation] };
                    }
                  })
                    .bindPopup(
                      `<h4 class="font-semibold">Route zu ${
                        entityRoute.title
                      }</h4><br/><div><span class="flex"><img class="w-4 h-4 mr-1" src=${getIcon(
                        r.meansOfTransportation
                      )} alt="icon" /><span>${
                        Number.isNaN(durationInMinutes)
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
          .filter(e => e.show)
          .forEach(entityRoute => {
            const { route } = entityRoute;
            if (isVisibleDestination(route)) {
              const popupContent = route.sections
                .map(
                  s =>
                    `<span class="flex"><img class="w-4 h-4 mr-1" src=${getIcon(
                      s.transportMode
                    )} alt="icon"/><span>${
                      Number.isNaN(s.duration)
                        ? s.duration
                        : timeToHumanReadable(s.duration)
                    }</span></span>`
                )
                .join("➟");
              const fullDuration = route.sections
                .map(s => s.duration)
                .reduce((p, c) => p + c);
              route.sections.forEach(s => {
                const line = L.geoJSON(s.geometry, {
                  style: function() {
                    return {
                      color: "#fcba03",
                      dashArray: getDashArray(s.transportMode)
                    };
                  }
                })
                  .bindPopup(
                    `<h4 class="font-semibold">ÖPNV Route zu ${
                      entityRoute.title
                    } (${
                      Number.isNaN(fullDuration)
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
      }
    }, [routes, transitRoutes, means, groupedEntities, config?.mapIcon]);

    const entitiesStringified = JSON.stringify(entities);
    const groupedEntitiesStringified = JSON.stringify(groupedEntities);

    // draw amenities
    useEffect(() => {
      const parsedEntities: ResultEntity[] | null = JSON.parse(
        entitiesStringified
      );
      let parsedEntityGroups: EntityGroup[] = JSON.parse(
        groupedEntitiesStringified
      );
      const drawAmenityMarkers = () => {
        if (currentMap) {
          currentMap.removeLayer(amenityMarkerGroup);
          amenityMarkerGroup = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
              const groupedMarkers = groupBy(
                cluster.getAllChildMarkers().map(m => m.getIcon().options),
                (i: any) => i.className
              );
              const countedMarkers = Object.entries(groupedMarkers)
                .map(([key, value]) => ({
                  key,
                  icon: (value as any)[0].html,
                  count: (value as any).length
                }))
                .sort((a, b) => b.count - a.count);
              const markerIcons = countedMarkers.map(
                cm =>
                  '<div class="flex items-center gap-0.5">' +
                  cm.icon +
                  cm.count +
                  "</div>"
              );
              return L.divIcon({
                html:
                  '<div class="cluster-icon-wrapper">' +
                  markerIcons.join("") +
                  "</div>",
                className: "cluster-icon"
              });
            },
            maxClusterRadius: 200,
            disableClusteringAtZoom: config?.groupItems ? 15 : 1,
            spiderfyOnMaxZoom: false,
            animate: false,
            zoomToBoundsOnClick: false
          });

          // set realEstateListing to active if theme is KF and group is real estate listings
          if (config?.theme === "KF") {
            parsedEntityGroups = parsedEntityGroups.map(peg => ({
              ...peg,
              active:
                config.theme === "KF" && peg.title === realEstateListingsTitle
                  ? true
                  : peg.active
            }));
          }

          parsedEntities?.forEach(entity => {
            if (
              parsedEntityGroups.some(
                eg => eg.title === entity.label && eg.active
              )
            ) {
              const isRealEstateListing = entity.type === "property";
              const isPreferredLocation = entity.type === "favorite";
              const markerIcon = isRealEstateListing
                ? config?.mapIcon
                  ? {
                      icon: config?.mapIcon,
                      color: config.primaryColor ?? realEstateListingsIcon.color
                    }
                  : realEstateListingsIcon
                : isPreferredLocation
                ? preferredLocationsIcon
                : deriveIconForOsmName(entity.type as OsmName);
              const icon = L.divIcon({
                iconUrl: markerIcon.icon,
                shadowUrl: leafletShadow,
                shadowSize: [0, 0],
                iconSize: defaultAmenityIconSize,
                className: `locality-marker-wrapper ${
                  isRealEstateListing && config?.mapIcon
                    ? "locality-marker-wrapper-custom"
                    : ""
                } icon-${entity.type}`,
                html:
                  config?.mapIcon && isRealEstateListing
                    ? `<img src="${markerIcon.icon}" alt="marker-icon" class="${entity.type} locality-icon-custom" />`
                    : `<div class="locality-marker" style="border-color: ${markerIcon.color}"><img src="${markerIcon.icon}" alt="marker-icon" class="${entity.type} locality-icon" /></div>`
              });
              const marker = new IdMarker(
                entity.coordinates,
                entity,
                searchAddress,
                {
                  icon
                }
              ).on("click", function(e) {
                const marker = e.target;
                marker.createOpenPopup();
              });
              amenityMarkerGroup.addLayer(marker);
            }
          });
          amenityMarkerGroup.on("clusterclick", function(a) {
            const centerOfGroup = center(a.layer.toGeoJSON());
            const lat = centerOfGroup.geometry.coordinates[1];
            const lng = centerOfGroup.geometry.coordinates[0];
            searchContextDispatch({
              type: SearchContextActionTypes.CENTER_ZOOM_COORDINATES,
              payload: {
                center: {
                  lat,
                  lng
                },
                zoom: 17
              }
            });
          });
          currentMap.addLayer(amenityMarkerGroup);
        }
      };
      if (currentMap) {
        drawAmenityMarkers();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      entitiesStringified,
      groupedEntitiesStringified,
      searchContextDispatch,
      config?.mapIcon
    ]);

    const takePicture = () => {
      const bottomElements = document.getElementsByClassName("leaflet-bottom");
      for (let i = 0; i < bottomElements.length; i++) {
        const className = bottomElements[i].className;
        bottomElements[i].className = className + " hidden";
      }

      html2canvas(document.querySelector("#mymap")!, {
        allowTaint: true,
        useCORS: true
      }).then(canvas => {
        const mapClippingDataUrl = canvas.toDataURL("image/jpeg", 1.0);
        searchContextDispatch({
          type: SearchContextActionTypes.ADD_MAP_CLIPPING,
          payload: {
            zoomLevel: mapZoomLevel || zoom,
            mapClippingDataUrl
          }
        });
        toastSuccess("Kartenausschnitt erfolgreich gespeichert!");
        for (let i = 0; i < bottomElements.length; i++) {
          bottomElements[i].className = bottomElements[i].className.replace(
            "hidden",
            ""
          );
        }
      });
    };

    const escFunction = useCallback(
      event => {
        if (event.keyCode === 27) {
          if (currentMap && fullscreen) {
            setFullscreen(false);
            setTimeout(function() {
              currentMap!.invalidateSize();
            }, 400);
          }
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

    const toggleFullscreen = () => {
      setFullscreen(!fullscreen);
      if (currentMap) {
        setTimeout(function() {
          currentMap!.invalidateSize();
        }, 400);
      }
    };

    const zoomToMeanBounds = (mean: MeansOfTransportation) => {
      if (currentMap) {
        const derivePolygonForMean = (mean: MeansOfTransportation) => {
          const derivePositionForTransportationMean = (
            profile: MeansOfTransportation
          ) => {
            return searchResponse.routingProfiles[
              profile
            ].isochrone.features[0].geometry.coordinates[0].map(
              (item: number[]) => {
                return [item[1], item[0]];
              }
            );
          };
          if (mean === MeansOfTransportation.WALK) {
            return L.polygon(
              derivePositionForTransportationMean(MeansOfTransportation.WALK),
              {
                color: WALK_COLOR
              }
            );
          }
          if (mean === MeansOfTransportation.BICYCLE) {
            return L.polygon(
              derivePositionForTransportationMean(
                MeansOfTransportation.BICYCLE
              ),
              {
                color: BICYCLE_COLOR
              }
            );
          }
          if (mean === MeansOfTransportation.CAR) {
            return L.polygon(
              derivePositionForTransportationMean(MeansOfTransportation.CAR),
              {
                color: CAR_COLOR
              }
            );
          }
        };
        const polygon = derivePolygonForMean(mean);
        currentMap!.fitBounds(polygon!.getBounds(), {
          padding: L.point(10, 10)
        });
        setTimeout(() => {
          searchContextDispatch({
            type: SearchContextActionTypes.CENTER_ZOOM_COORDINATES,
            payload: {
              zoom: currentMap?.getZoom()!,
              center: searchResponse.centerOfInterest.coordinates
            }
          });
        }, 1000);
      }
    };

    return (
      <div
        className={`leaflet-container leaflet-container-${config?.theme} w-full`}
        id={leafletMapId}
        data-tour="map"
      >
        {!!onPoiAdd && (
          <FormModal modalConfig={addPoiModalOpenConfig}>
            <AddPoiFormHandler
              centerCoordinates={searchResponse.centerOfInterest.coordinates}
              coordinates={addPoiCoordinates}
              address={addPoiAddress}
              onPoiAdd={onPoiAdd}
            ></AddPoiFormHandler>
          </FormModal>
        )}
        <div className={`leaflet-bottom leaflet-left mb-20 cursor-pointer`}>
          <div
            data-tour="zoom-to-bounds"
            className="leaflet-control-zoom leaflet-bar leaflet-control"
          >
            {means.byFoot && (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                data-tour="show-foot-bounds"
                className="leaflet-control-zoom-in cursor-pointer p-2"
                role="button"
                onClick={() => zoomToMeanBounds(MeansOfTransportation.WALK)}
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
                onClick={() => zoomToMeanBounds(MeansOfTransportation.BICYCLE)}
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
                onClick={() => zoomToMeanBounds(MeansOfTransportation.CAR)}
              >
                <img src={carIcon} alt="zoom to car" />
              </a>
            )}
          </div>
          {!embedMode && (
            <div className={`leaflet-control-zoom leaflet-bar leaflet-control`}>
              <a
                href="/"
                data-tour="go-fullscreen"
                className="leaflet-control-zoom-in cursor-pointer"
                role="button"
                onClick={event => {
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
              <a
                href="/"
                data-tour="take-map-picture"
                className="leaflet-control-zoom-in cursor-pointer"
                role="button"
                onClick={event => {
                  event.preventDefault();
                  takePicture();
                }}
              >
                📷
              </a>
            </div>
          )}
        </div>
      </div>
    );
  },
  areMapPropsEqual
);

export default Map;

import center from "@turf/center";
import {
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
import { ApiRoute, ApiTransitRoute } from "../../../shared/types/routing";
import {
  ApiCoordinates,
  ApiSearchResponse,
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
import {
  EntityGroup,
  EntityRoute,
  EntityTransitRoute,
  ResultEntity
} from "../components/SearchResultContainer";
import {
  deriveIconForOsmName,
  deriveMinutesFromMeters,
  preferredLocationsIcon,
  realEstateListingsIcon,
  timeToHumanReadable,
  toastSuccess
} from "../shared/shared.functions";
import "./Map.css";
import "leaflet-touch-helper";

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
  printingActive?: boolean;
  printingCheatsheetActive?: boolean;
  means: {
    byFoot: boolean;
    byBike: boolean;
    byCar: boolean;
  };
  highlightId?: string | null | undefined;
  routes: EntityRoute[];
  transitRoutes: EntityTransitRoute[];
  embedMode?: boolean;
}

export class IdMarker extends L.Marker {
  entity: ResultEntity;

  constructor(
    latLng: L.LatLngExpression,
    entity: ResultEntity,
    options?: L.MarkerOptions
  ) {
    super(latLng, options);
    this.entity = entity;
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
      const title = `<h4>${this.entity.name || this.entity.label}</h4>`;
      const street =
        this.entity.address.street && this.entity.address.street !== "undefined"
          ? this.entity.address.street
          : null;
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
      this.bindPopup(
        `<span class="font-semibold">${title}</span><br />${
          street ? "<div>" + street + "</div><br />" : ""
        }<div class="flex gap-6">${
          !isRealEstateListingOrPreferredAdress ? byFoot : ""
        }${!isRealEstateListingOrPreferredAdress ? byBike : ""}${
          !isRealEstateListingOrPreferredAdress ? byCar : ""
        }</div>`
      );
    }
    this.openPopup();
  }
}

export const defaultMapZoom = 15;
const defaultAmenityIconSize = new L.Point(32, 32);
const myLocationIconSize = new L.Point(46, 46);

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
  const printingActiveEqual =
    prevProps.printingActive === nextProps.printingActive;
  const printingCheatsheetActiveEqual =
    prevProps.printingCheatsheetActive === nextProps.printingCheatsheetActive;
  const highlightIdEqual = prevProps.highlightId === nextProps.highlightId;
  const routesEqual = prevProps.routes === nextProps.routes;
  const transitRoutesEqual =
    prevProps.transitRoutes === nextProps.transitRoutes;
  return (
    mapboxKeyEqual &&
    responseEqual &&
    searchAdressEqual &&
    entitiesEqual &&
    entityGroupsEqual &&
    meansEqual &&
    mapCenterEqual &&
    printingActiveEqual &&
    printingCheatsheetActiveEqual &&
    mapZoomLevelEqual &&
    highlightIdEqual &&
    routesEqual &&
    transitRoutesEqual
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
    embedMode = false
  }) => {
    const { lat, lng } = searchResponse.centerOfInterest.coordinates;

    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
      document.body.classList.toggle("fullscreen", fullscreen);
    }, [fullscreen]);

    // main map draw
    useEffect(() => {
      const attribution =
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
      const url =
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";

      if (currentMap !== undefined) {
        currentMap.off();
        currentMap.remove();
      }
      const initialPosition: L.LatLngExpression = [lat, lng];
      const localMap = L.map(leafletMapId, {
        preferCanvas: true,
        renderer: new L.Canvas(),
        tap: false,
        maxZoom: 18,
        zoomControl: false
      }).setView(initialPosition, zoom);

      const zoomControl = L.control.zoom({ position: "bottomleft" });
      zoomControl.addTo(localMap);

      L.tileLayer(url, {
        attribution,
        id: "kudiba-tech/ckvu0ltho2j9214p847jp4t4m",
        zoomOffset: -1,
        accessToken: mapBoxAccessToken,
        tileSize: 512,
        maxZoom: 18
      }).addTo(localMap);
      const positionIcon = L.Icon.extend({
        options: {
          iconUrl: mylocationIcon,
          shadowUrl: leafletShadow,
          shadowSize: [0, 0],
          iconSize: myLocationIconSize
        }
      });
      L.marker([lat, lng], {
        icon: new positionIcon()
      })
        .bindPopup(searchAddress)
        .addTo(localMap);

      currentMap = localMap;
    }, [
      lat,
      lng,
      leafletMapId,
      searchContextDispatch,
      mapBoxAccessToken,
      searchAddress
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
    }, [meansStringified, searchResponse.routingProfiles]);

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
    }, [routes, transitRoutes, means, groupedEntities]);

    const entitiesStringified = JSON.stringify(entities);
    const groupedEntitiesStringified = JSON.stringify(groupedEntities);

    // draw amenities
    useEffect(() => {
      const parsedEntities: ResultEntity[] | null = JSON.parse(
        entitiesStringified
      );
      const parsedEntityGroups: EntityGroup[] = JSON.parse(
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
            disableClusteringAtZoom: 15,
            spiderfyOnMaxZoom: false,
            animate: false,
            zoomToBoundsOnClick: false
          });
          parsedEntities?.forEach(entity => {
            if (
              parsedEntityGroups.some(
                eg => eg.title === entity.label && eg.active
              )
            ) {
              const isRealEstateListing = entity.type === "property";
              const isPreferredLocation = entity.type === "favorite";
              const markerIcon = isRealEstateListing
                ? realEstateListingsIcon
                : isPreferredLocation
                ? preferredLocationsIcon
                : deriveIconForOsmName(entity.type as OsmName);
              const icon = L.divIcon({
                iconUrl: markerIcon.icon,
                shadowUrl: leafletShadow,
                shadowSize: [0, 0],
                iconSize: defaultAmenityIconSize,
                className: "locality-marker-wrapper icon-" + entity.type,
                html: `<div class="locality-marker" style="border-color: ${markerIcon.color}"><img src="${markerIcon.icon}" alt="marker-icon" class="${entity.type} locality-icon" /></div>`
              });
              const marker = new IdMarker(entity.coordinates, entity, {
                icon
              }).on("click", function(e) {
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
    }, [
      entitiesStringified,
      groupedEntitiesStringified,
      searchContextDispatch
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
        className="leaflet-container w-full"
        id={leafletMapId}
        data-tour="map"
      >
        <div className="leaflet-bottom leaflet-left mb-20 cursor-pointer">
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
            <div className="leaflet-control-zoom leaflet-bar leaflet-control">
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

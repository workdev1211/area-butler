import center from "@turf/center";
import { SearchContext, SearchContextActions } from "context/SearchContext";
import { FederalElectionDistrict, FederalElectionResult } from "hooks/federalelectiondata";
import html2canvas from 'html2canvas';
import * as L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import leafletShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import React, { useContext, useEffect } from "react";
import { ApiRoute } from "../../../shared/types/routing";
import {
    ApiCoordinates,
    ApiGeojsonFeature,
    ApiSearchResponse,
    MeansOfTransportation,
    OsmName
} from "../../../shared/types/types";
import mylocationIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import bikeIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import { ConfigContext } from "../context/ConfigContext";
import { EntityGroup, EntityRoute, ResultEntity } from "../pages/SearchResultPage";
import {
    deriveIconForOsmName,
    deriveMinutesFromMeters,
    preferredLocationsIcon,
    realEstateListingsIcon
} from "../shared/shared.functions";
import "./Map.css";

export interface MapProps {
    searchResponse: ApiSearchResponse;
    censusData: ApiGeojsonFeature[];
    federalElectionData: FederalElectionDistrict;
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
    },
    highlightId?: string;
    routes: EntityRoute[]
}

export class IdMarker extends L.Marker {
    entity: ResultEntity;

    constructor(latLng: L.LatLngExpression, entity: ResultEntity, options?: L.MarkerOptions) {
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
            const street = this.entity.address.street && this.entity.address.street !== 'undefined' ? this.entity.address.street : null;
            const byFoot = this.entity.byFoot ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${walkIcon} alt="icon" /><span>${deriveMinutesFromMeters(this.entity.distanceInMeters, MeansOfTransportation.WALK)} min.</span></span>` : '';
            const byBike = this.entity.byBike ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${bikeIcon} alt="icon" /><span>${deriveMinutesFromMeters(this.entity.distanceInMeters, MeansOfTransportation.BICYCLE)} min.</span></span>` : '';
            const byCar = this.entity.byCar ? `<span class="flex"><img class="w-4 h-4 mr-1" src=${carIcon} alt="icon" /><span>${deriveMinutesFromMeters(this.entity.distanceInMeters, MeansOfTransportation.CAR)} min.</span></span>` : '';
            this.bindPopup(`<span class="font-semibold">${title}</span><br />${street? '<div>' + street + '</div><br />' : ''}<div class="flex gap-6">${byFoot}${byBike}${byCar}</div>`);
        }
        this.openPopup();
    }
}

export const defaultMapZoom = 15;
const defaultAmenityIconSize = new L.Point(20, 20);
const myLocationIconSize = new L.Point(40, 40);

let zoom = defaultMapZoom;
let currentMap: L.Map | undefined;
let meansGroup = L.layerGroup();
let censusGroup = L.layerGroup();
let federalElectionGroup = L.layerGroup();
let routesGroup = L.layerGroup();
let amenityMarkerGroup = L.markerClusterGroup();

const areMapPropsEqual = (prevProps: MapProps, nextProps: MapProps) => {
    const responseEqual = JSON.stringify(prevProps.searchResponse) === JSON.stringify(nextProps.searchResponse);
    const entitiesEqual = JSON.stringify(prevProps.entities) === JSON.stringify(nextProps.entities);
    const entityGroupsEqual = JSON.stringify(prevProps.groupedEntities) === JSON.stringify(nextProps.groupedEntities);
    const meansEqual = JSON.stringify(prevProps.means) === JSON.stringify(nextProps.means);
    const mapCenterEqual = JSON.stringify(prevProps.mapCenter) === JSON.stringify(nextProps.mapCenter);
    const mapZoomLevelEqual = prevProps.mapZoomLevel === nextProps.mapZoomLevel;
    const printingActiveEqual = prevProps.printingActive === nextProps.printingActive;
    const printingCheatsheetActiveEqual = prevProps.printingCheatsheetActive === nextProps.printingCheatsheetActive;
    const censusDataEqual = JSON.stringify(prevProps.censusData) === JSON.stringify(nextProps.censusData);    
    const federalElectionDataEqual = JSON.stringify(prevProps.federalElectionData) === JSON.stringify(nextProps.federalElectionData);    
    const highlightIdEqual = prevProps.highlightId === nextProps.highlightId;
    const routesEqual = prevProps.routes === nextProps.routes;
    return responseEqual && entitiesEqual && entityGroupsEqual && meansEqual && mapCenterEqual && printingActiveEqual && printingCheatsheetActiveEqual && mapZoomLevelEqual && censusDataEqual && federalElectionDataEqual && highlightIdEqual && routesEqual;
}

const WALK_COLOR = '#c91444';
const BICYCLE_COLOR = '#8f72eb';
const CAR_COLOR = '#1f2937';

const MEAN_COLORS: {[key in keyof typeof MeansOfTransportation]: string } = {
    [MeansOfTransportation.CAR]: CAR_COLOR,
    [MeansOfTransportation.BICYCLE]: BICYCLE_COLOR,
    [MeansOfTransportation.WALK]: WALK_COLOR
}
const Map = React.memo<MapProps>(({
                                      searchResponse,
                                      entities,
                                      groupedEntities,
                                      means,
                                      mapCenter,
                                      printingActive,
                                      printingCheatsheetActive,
                                      mapZoomLevel,
                                      leafletMapId = 'mymap',
                                      censusData,
                                      federalElectionData,
                                      highlightId,
                                      routes
                                  }) => {
    const {lat, lng} = searchResponse.centerOfInterest.coordinates;

    const {mapBoxAccessToken} = useContext(ConfigContext);
    const {searchContextDispatch} = useContext(SearchContext);

    // main map draw
    useEffect(() => {
        const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
        const url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

        if (currentMap !== undefined) {
            currentMap.off();
            currentMap.remove();
        }
        const initialPosition: L.LatLngExpression = [lat, lng];
        const localMap = L.map(leafletMapId, {
            scrollWheelZoom: false,
            preferCanvas: true,
            renderer: new L.Canvas(),
            tap: false,
            maxZoom: 18,
            zoomControl: false
        }).setView(initialPosition, zoom);

        localMap.addEventListener("zoomend", (value) => {
            zoom = value.target._zoom;
            searchContextDispatch({type: SearchContextActions.SET_MAP_ZOOM_LEVEL, payload: zoom})
        });
        localMap.on('moveend', (event) => {
            if (!!event?.target?.getCenter()) {
                const center = event.target.getCenter();
                searchContextDispatch({type: SearchContextActions.SET_MAP_CENTER, payload: center});
            }
        });

        const zoomControl = L.control.zoom({position: 'bottomleft'});
        zoomControl.addTo(localMap);

        L.tileLayer(url, {
                attribution,
                id: "mapbox/light-v10",
                zoomOffset: -1,
                accessToken: mapBoxAccessToken,
                tileSize: 512,
                maxZoom: 18
            }
        ).addTo(localMap);
        const positionIcon = L.Icon.extend({
            options: {
                iconUrl: mylocationIcon,
                shadowUrl: leafletShadow,
                shadowSize: [0, 0],
                iconSize: myLocationIconSize,
            }
        });
        L.marker([lat, lng], {
            icon: new positionIcon()
        }).bindPopup('Mein Standort').addTo(localMap);

        currentMap = localMap;
    }, [lat, lng, leafletMapId, searchContextDispatch, mapBoxAccessToken]);

    // react on zoom and center change
    useEffect(() => {
        if (currentMap && mapCenter && mapZoomLevel) {
            // center and zoom view
            currentMap.setView(mapCenter, mapZoomLevel);
            // handle growing/shrinking of icons based on zoom level
            if (amenityMarkerGroup) {
                const markers = (amenityMarkerGroup.getLayers() as IdMarker[]);
                if (markers.length) {
                    const currentSize = markers[0].getIcon().options.iconSize;
                    if ((currentSize as L.Point).x === 20 && mapZoomLevel >= 17) {
                        markers.forEach(marker => {
                            const icon = marker.getIcon();
                            icon.options.iconSize = new L.Point(35, 35);
                            marker.setIcon(icon);
                        });
                    }
                    if ((currentSize as L.Point).x === 35 && mapZoomLevel < 17) {
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
                                marker.createOpenPopup()
                                searchContextDispatch({type: SearchContextActions.SET_HIGHLIGHT_ID, payload: null});
                            }
                            , 1200);
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
            const derivePositionForTransportationMean = (profile: MeansOfTransportation) => {
                return searchResponse.routingProfiles[profile].isochrone.features[0].geometry.coordinates[0].map((item: number[]) => {
                    return [item[1], item[0]];
                });
            }
            if (parsedMeans.byFoot) {
                L.polygon(derivePositionForTransportationMean(MeansOfTransportation.WALK), {
                    color: WALK_COLOR
                }).addTo(meansGroup);
            }
            if (parsedMeans.byBike) {
                L.polygon(derivePositionForTransportationMean(MeansOfTransportation.BICYCLE), {
                    color: BICYCLE_COLOR
                }).addTo(meansGroup);
            }
            if (parsedMeans.byCar) {
                L.polygon(derivePositionForTransportationMean(MeansOfTransportation.CAR), {
                    color: CAR_COLOR
                }).addTo(meansGroup);
            }
        }
    }, [meansStringified, searchResponse.routingProfiles]);



    // draw routes
    useEffect(() => {
        const activeEntities = groupedEntities?.filter(ge => ge.active).flatMap(value => value.items);
        const isActiveMeans = (r: ApiRoute) => (r.meansOfTransportation === MeansOfTransportation.WALK && means.byFoot) ||
            (r.meansOfTransportation=== MeansOfTransportation.CAR && means.byCar) ||
            (r.meansOfTransportation === MeansOfTransportation.BICYCLE && means.byBike);

        const isVisibleDestination = (r: ApiRoute) =>
            !!activeEntities.find(value => value.coordinates.lat === r.destination.lat
               && value.coordinates.lng === r.destination.lng);


        if (currentMap) {
            if (routesGroup) {
                currentMap.removeLayer(routesGroup);
            }
            routesGroup = L.layerGroup();
            currentMap.addLayer(routesGroup);
            routes.filter(e => e.show).forEach(entityRoute => {
                entityRoute.routes.filter(isActiveMeans).filter(isVisibleDestination).forEach( (r) => {
                    r.sections.forEach((s) => {
                        L.geoJSON(s.geometry, {style: function (feature) {
                                return {color: MEAN_COLORS[r.meansOfTransportation]};
                            }}).addTo(routesGroup)
                    })
                })
            })
        }
    }, [routes, means, groupedEntities]);

    // draw census
    useEffect(() => {
        if (currentMap && censusGroup) {
            currentMap.removeLayer(censusGroup);
        }
        if (currentMap && censusData?.length) {
            censusGroup = L.layerGroup();
            currentMap.addLayer(censusGroup);
            censusData.forEach((c: any) => {
                const propertyTable = (p: { label: string, value: string, unit: string }) => `<tr><td>${p.label}</td><td>${p.value} ${p.unit}</td></tr>`;
                const table = `<table><tbody>${c.properties.map(propertyTable).join("")}</tbody></table>`;
                L.geoJSON(c).addTo(censusGroup!).bindTooltip(table);
            })
        }
    }, [censusData]);

    // draw federal election
    useEffect(() => {
        if (currentMap && federalElectionGroup) {
            currentMap.removeLayer(federalElectionGroup);
        }
        if (currentMap && !!federalElectionData) {
            federalElectionGroup = L.layerGroup();
            currentMap.addLayer(federalElectionGroup);
            const propertyTable = (p: FederalElectionResult) => `<tr><td>${p.party}</td><td>${p.percentage}</td><td>${p.lastElectionPercentage}</td></tr>`;
            const table = `<h1>${federalElectionData.name}</h1><table><tbody>${federalElectionData.results.sort((r1, r2) => r2.percentage - r1.percentage).map(propertyTable).join("")}</tbody></table>`;

            L.geoJSON(federalElectionData).addTo(federalElectionGroup!).bindTooltip(table);
        }
    }, [federalElectionData]);


    const entitiesStringified = JSON.stringify(entities);
    const groupedEntitiesStringified = JSON.stringify(groupedEntities);

    // draw amenities
    useEffect(() => {
        const groupBy = (xs: any, key: any) => {
            return xs.reduce(function (rv: any, x: any) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        const parsedEntities: ResultEntity[] | null = JSON.parse(entitiesStringified);
        const parsedEntityGroups: EntityGroup[] = JSON.parse(groupedEntitiesStringified);
        const drawAmenityMarkers = (localZoom: number) => {
            if (currentMap) {
                currentMap.removeLayer(amenityMarkerGroup);
                amenityMarkerGroup = L.markerClusterGroup({
                    iconCreateFunction: function (cluster) {
                        const groupedMarkers = groupBy(cluster.getAllChildMarkers().map(m => m.getIcon().options), 'className');
                        const countedMarkers = Object.entries(groupedMarkers).map(([key, value]) => ({
                            key,
                            icon: (value as any)[0].html,
                            count: (value as any).length
                        })).sort((a, b) => b.count - a.count);
                        // const markerIcons = countedMarkers.map(cm => '<div style="display: flex;"><img class="' + cm.key + '" src="' + cm.icon + '" />' + cm.count + '</div>');
                        const markerIcons = countedMarkers.map(cm => '<div class="flex items-center gap-0.5">' + cm.icon + cm.count + '</div>');
                        return L.divIcon({
                            html: '<div class="cluster-icon-wrapper">' + markerIcons.join('') + '</div>',
                            className: 'cluster-icon'
                        });
                    },
                    maxClusterRadius: 140,
                    disableClusteringAtZoom: 16,
                    spiderfyOnMaxZoom: false,
                    animate: false,
                    zoomToBoundsOnClick: false
                });
                parsedEntities?.forEach(entity => {
                    if (parsedEntityGroups.some(eg => eg.title === entity.label && eg.active)) {
                        const isRealEstateListing = entity.type === 'property';
                        const isPreferredLocation = entity.type === 'favorite';
                        const markerIcon = isRealEstateListing ? realEstateListingsIcon : isPreferredLocation ? preferredLocationsIcon : deriveIconForOsmName(entity.type as OsmName);
                        const icon = L.divIcon({
                            iconUrl: markerIcon.icon,
                            shadowUrl: leafletShadow,
                            shadowSize: [0, 0],
                            iconSize: defaultAmenityIconSize,
                            className: 'locality-marker-wrapper icon-' +entity.type,
                            html: `<div class="locality-marker" style="border-color: ${markerIcon.color}"><img src="${markerIcon.icon}" alt="marker-icon" class="${entity.type}" /></div>`
                        });
                        const marker = new IdMarker(entity.coordinates, entity, {
                            icon,
                        }).on('click', function (e) {
                            const marker = e.target;
                            marker.createOpenPopup();
                        });
                        amenityMarkerGroup.addLayer(marker);
                    }
                });
                amenityMarkerGroup.on('clusterclick', function (a) {
                    const centerOfGroup = center(a.layer.toGeoJSON());
                    searchContextDispatch({
                        type: SearchContextActions.CENTER_ZOOM_COORDINATES,
                        payload: {center: centerOfGroup.geometry.coordinates.reverse(), zoom: 17}
                    });
                });
                currentMap.addLayer(amenityMarkerGroup);
            }
        }
        if (currentMap) {
            drawAmenityMarkers(zoom);
        }
    }, [entitiesStringified, groupedEntitiesStringified, searchContextDispatch]);

    // print actions
    useEffect(() => {
        if (printingActive || printingCheatsheetActive) {
            setTimeout(() => {
                html2canvas(document.querySelector("#mymap")!, {
                    allowTaint: true,
                    useCORS: true,
                }).then((canvas) => {
                    const mapClippingDataUrl = canvas.toDataURL("image/jpeg", 1.0);
                    searchContextDispatch({
                        type: SearchContextActions.ADD_MAP_CLIPPING,
                        payload: {
                            zoomLevel: mapZoomLevel || zoom,
                            mapClippingDataUrl,
                        },
                    });
                });
            }, 2000);
        }

    }, [printingActive, printingCheatsheetActive, mapZoomLevel, searchContextDispatch]);

    return (
        <div className='leaflet-container w-full' id={leafletMapId} data-tour="map">
        </div>
    )
}, areMapPropsEqual);

export default Map;

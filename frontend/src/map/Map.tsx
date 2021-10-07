import React, {useContext, useEffect} from "react";
import * as L from "leaflet";
import "leaflet.markercluster";
import "./Map.css";
import "./makiIcons.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import leafletIcon from "leaflet/dist/images/marker-icon.png";
import leafletShadow from "leaflet/dist/images/marker-shadow.png";
import {ApiCoordinates, ApiGeojsonFeature, ApiSearchResponse, MeansOfTransportation} from "../../../shared/types/types";
import {ConfigContext} from "../context/ConfigContext";
import {ResultEntity} from "../search/SearchResult";
import {fallbackIcon, osmNameToIcons} from "./makiIcons";
import {SearchContext, SearchContextActions} from "context/SearchContext";
import html2canvas from 'html2canvas';

export interface MapProps {
    searchResponse: ApiSearchResponse;
    censusData: ApiGeojsonFeature[];
    entities: ResultEntity[] | null;
    selectedCenter?: ApiCoordinates;
    selectedZoomLevel?: number;
    leafletMapId?: string;
    printingActive?: boolean;
    means: {
        byFoot: boolean;
        byBike: boolean;
        byCar: boolean;
    },
    highlightId?: number;
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
        if (!this.getPopup()) {
            this.bindPopup(`${this.entity.name || this.entity.label}`);
        }
        this.openPopup();
    }
}

export const defaultMapZoom = 15;
const defaultAmenityIconSize = new L.Point(20, 20);

let zoom = defaultMapZoom;
let currentMap: L.Map | undefined;
let meansGroup = L.layerGroup();
let censusGroup = L.layerGroup();
let amenityMarkerGroup = L.markerClusterGroup();

const areMapPropsEqual = (prevProps: MapProps, nextProps: MapProps) => {
    const responseEqual = JSON.stringify(prevProps.searchResponse) === JSON.stringify(nextProps.searchResponse);
    const entitiesEqual = JSON.stringify(prevProps.entities) === JSON.stringify(nextProps.entities);
    const meansEqual = JSON.stringify(prevProps.means) === JSON.stringify(nextProps.means);
    const selectedCenterEqual = JSON.stringify(prevProps.selectedCenter) === JSON.stringify(nextProps.selectedCenter);
    const selectedZoomLevelEqual = prevProps.selectedZoomLevel === nextProps.selectedZoomLevel;
    const printingActiveEqual = prevProps.printingActive === nextProps.printingActive;
    const censusDataEqual = JSON.stringify(prevProps.censusData) === JSON.stringify(nextProps.censusData);
    const highlightIdEqual = prevProps.highlightId === nextProps.highlightId;
    return responseEqual && entitiesEqual && meansEqual && selectedCenterEqual && printingActiveEqual && selectedZoomLevelEqual && censusDataEqual && highlightIdEqual;
}

const Map = React.memo<MapProps>(({
                                      searchResponse,
                                      entities,
                                      means,
                                      selectedCenter,
                                      printingActive,
                                      selectedZoomLevel,
                                      leafletMapId = 'mymap',
                                      censusData,
                                      highlightId
                                  }) => {
    const {lat, lng} = searchResponse.centerOfInterest.coordinates;
    const initialPosition: L.LatLngExpression = [lat, lng];

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
        const localMap = L.map(leafletMapId, {
            scrollWheelZoom: false,
            preferCanvas: true,
            renderer: new L.Canvas(),
            tap: false,
            maxZoom: 18
        }).setView(initialPosition, zoom);

        localMap.addEventListener("zoomend", (value) => {
            zoom = value.target._zoom;
            searchContextDispatch({type: SearchContextActions.SET_SELECTED_ZOOM_LEVEL, payload: zoom})
        });
        localMap.on('moveend', (event) => {
            if (!!event?.target?.getCenter()) {
                const center = event.target.getCenter();
                searchContextDispatch({type: SearchContextActions.SET_SELECTED_CENTER, payload: center});
            }
        });
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
                iconUrl: leafletIcon,
                shadowUrl: leafletShadow
            }
        });
        L.marker([lat, lng], {
            icon: new positionIcon()
        }).bindPopup('Mein Standort').addTo(localMap);

        currentMap = localMap;
    }, [lat, lng]);

    // react on zoom and center change
    useEffect(() => {
        if (currentMap && selectedCenter && selectedZoomLevel) {
            // center and zoom view
            currentMap.setView(selectedCenter, selectedZoomLevel);
            // handle growing/shrinking of icons based on zoom level
            if (amenityMarkerGroup) {
                const markers = (amenityMarkerGroup.getLayers() as IdMarker[]);
                if (markers.length) {
                    const currentSize = markers[0].getIcon().options.iconSize;
                    if ((currentSize as L.Point).x === 20 && selectedZoomLevel >= 17) {
                        markers.forEach(marker => {
                            const icon = marker.getIcon();
                            icon.options.iconSize = new L.Point(35, 35);
                            marker.setIcon(icon);
                        });
                    }
                    if ((currentSize as L.Point).x === 35 && selectedZoomLevel < 17) {
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
    }, [currentMap, amenityMarkerGroup, selectedCenter, selectedZoomLevel, highlightId]);

    // draw means
    useEffect(() => {
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
            if (means.byFoot) {
                L.polygon(derivePositionForTransportationMean(MeansOfTransportation.WALK), {
                    color: 'blue'
                }).addTo(meansGroup);
            }
            if (means.byBike) {
                L.polygon(derivePositionForTransportationMean(MeansOfTransportation.BICYCLE), {
                    color: 'green'
                }).addTo(meansGroup);
            }
            if (means.byCar) {
                L.polygon(derivePositionForTransportationMean(MeansOfTransportation.CAR), {
                    color: 'gray'
                }).addTo(meansGroup);
            }
        }
    }, [currentMap, JSON.stringify(means)]);

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
    }, [currentMap, censusData]);

    // draw amenities
    useEffect(() => {
        const groupBy = (xs: any, key: any) => {
            return xs.reduce(function (rv: any, x: any) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        const drawAmenityMarkers = (localZoom: number) => {
            if (currentMap) {
                currentMap.removeLayer(amenityMarkerGroup);
                amenityMarkerGroup = L.markerClusterGroup({
                    iconCreateFunction: function (cluster) {
                        const groupedMarkers = groupBy(cluster.getAllChildMarkers().map(m => m.getIcon().options), 'className');
                        const countedMarkers = Object.entries(groupedMarkers).map(([key, value]) => ({
                            key,
                            icon: (value as any)[0].iconUrl,
                            count: (value as any).length
                        })).sort((a, b) => b.count - a.count);
                        const markerIcons = countedMarkers.map(cm => '<div style="display: flex;"><img class="' + cm.key + '" src="' + cm.icon + '" />' + cm.count + '</div>');
                        return L.divIcon({
                            html: '<div class="cluster-icon-wrapper">' + markerIcons.join('') + '</div>',
                            className: 'cluster-icon'
                        });
                    },
                    maxClusterRadius: 140,
                    disableClusteringAtZoom: 16,
                    spiderfyOnMaxZoom: false
                });
                entities?.forEach(entity => {
                    const icon = new L.Icon({
                        iconUrl: osmNameToIcons.find(entry => entry.name === entity.type)?.icon || fallbackIcon,
                        shadowUrl: leafletShadow,
                        shadowSize: [0, 0],
                        iconSize: defaultAmenityIconSize,
                        className: entity.type
                    });
                    const marker = new IdMarker(entity.coordinates, entity, {
                        icon,
                    }).on('click', function (e) {
                        const marker = e.target;
                        marker.createOpenPopup();
                    });
                    amenityMarkerGroup.addLayer(marker);
                });
                currentMap.addLayer(amenityMarkerGroup);
            }
        }
        if (currentMap) {
            drawAmenityMarkers(zoom);
        }
    }, [currentMap, entities]);

    // print actions
    useEffect(() => {
        if (printingActive) {
            setTimeout(() => {
                html2canvas(document.querySelector("#mymap")!, {
                    allowTaint: true,
                    useCORS: true,
                }).then((canvas) => {
                    const mapClippingDataUrl = canvas.toDataURL("image/jpeg", 1.0);
                    searchContextDispatch({
                        type: SearchContextActions.ADD_MAP_CLIPPING,
                        payload: {
                            zoomLevel: selectedZoomLevel || zoom,
                            mapClippingDataUrl,
                        },
                    });
                });
            }, 2000);
        }

    }, [currentMap, printingActive, selectedZoomLevel]);

    return (
        <div className='leaflet-container' id={leafletMapId}>
        </div>
    )
}, areMapPropsEqual);

export default Map;

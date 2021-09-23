import React, {useContext, useEffect, useState} from "react";
import * as L from "leaflet";
import "leaflet.markercluster";
import "./Map.css";
import "./makiIcons.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import leafletIcon from "leaflet/dist/images/marker-icon.png";
import leafletShadow from "leaflet/dist/images/marker-shadow.png";
import {ApiCoordinates, ApiSearchResponse, MeansOfTransportation} from "../../../shared/types/types";
import {ConfigContext} from "../context/ConfigContext";
import {ResultEntity} from "../search/SearchResult";
import {fallbackIcon, osmNameToIcons} from "./makiIcons";
import { off } from "process";

export interface MapProps {
    searchResponse: ApiSearchResponse;
    entities: ResultEntity[] | null;
    selectedCenter?: ApiCoordinates;
    means: {
        byFoot: boolean;
        byBike: boolean;
        byCar: boolean;
    }
}

let currentMap: L.Map | undefined;
let zoom = 15;
let amenityMarkerGroup = L.markerClusterGroup();

const areMapPropsEqual = (prevProps: MapProps, nextProps: MapProps) => {
    const responseEqual = JSON.stringify(prevProps.searchResponse) === JSON.stringify(nextProps.searchResponse);
    const entitiesEqual = JSON.stringify(prevProps.entities) === JSON.stringify(nextProps.entities);
    const meansEqual = JSON.stringify(prevProps.means) === JSON.stringify(nextProps.means);
    return responseEqual && entitiesEqual && meansEqual;
}

const Map = React.memo<MapProps>(({searchResponse, entities, means}) => {
    const {lat, lng} = searchResponse.centerOfInterest.coordinates;

    const {mapBoxAccessToken} = useContext(ConfigContext);


    useEffect(() => {

        const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
        const url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
        const initialPosition: L.LatLngExpression = [lat, lng];

        const derivePositionForTransportationMean = (profile: MeansOfTransportation) => {
            return searchResponse.routingProfiles[profile].isochrone.features[0].geometry.coordinates[0].map((item: number[]) => {
                return [item[1], item[0]];
            });
        }

        const groupBy = (xs: any, key: any) => {
            return xs.reduce(function(rv: any, x: any) {
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
                        iconSize: localZoom >= 16 ? new L.Point(35, 35) : new L.Point(20, 20),
                        className: entity.type
                    });
                    const marker = L.marker(entity.coordinates, {
                        icon,
                    }).on('click', function (e) {
                        const marker = e.target;
                        marker.bindPopup(`${entity.name || 'Name nicht bekannt'}`);
                        marker.openPopup();
                    });
                    amenityMarkerGroup.addLayer(marker);
                });
                currentMap.addLayer(amenityMarkerGroup);
            }
        }

        if (currentMap !== undefined) {
            currentMap.off();
            currentMap.remove();
        }
        const localMap = L.map('mymap', {
            scrollWheelZoom: false,
            preferCanvas: true,
            renderer: new L.Canvas(),
            tap: false,
            maxZoom: 18
        }).setView(initialPosition, zoom);
        localMap.addEventListener("zoom", (value) => {
           zoom = value.target._zoom;
            drawAmenityMarkers(value.target._zoom);
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

        if (means.byFoot) {
            L.polygon(derivePositionForTransportationMean(MeansOfTransportation.WALK), {
                color: 'blue'
            }).addTo(localMap);
        }
        if (means.byBike) {
            L.polygon(derivePositionForTransportationMean(MeansOfTransportation.BICYCLE), {
                color: 'green'
            }).addTo(localMap);
        }
        if (means.byCar) {
            L.polygon(derivePositionForTransportationMean(MeansOfTransportation.CAR), {
                color: 'gray'
            }).addTo(localMap);
        }
        const positionIcon = L.Icon.extend({options: {
            iconUrl: leafletIcon,
            shadowUrl: leafletShadow
        }});
        L.marker([lat, lng], {
            icon: new positionIcon()
        }).bindPopup('Mein Standort').addTo(localMap);

        currentMap = localMap;
        drawAmenityMarkers(zoom);
    }, [searchResponse, means, mapBoxAccessToken, entities, lat, lng]);



    return (
        <div className="leaflet-container" id="mymap">
        </div>
    )
}, areMapPropsEqual);

export default Map;

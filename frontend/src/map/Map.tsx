import React, {useContext, useEffect, useState} from "react";
import L from "leaflet";
import "./Map.css";
import "./makiIcons.css";
import "leaflet/dist/leaflet.css";
import leafletIcon from "leaflet/dist/images/marker-icon.png";
import leafletShadow from "leaflet/dist/images/marker-shadow.png";
import {ApiSearchResponse, MeansOfTransportation} from "../../../shared/types/types";
import {ConfigContext} from "../context/ConfigContext";
import {ResultEntity} from "../search/SearchResult";
import {fallbackIcon, osmNameToIcons} from "./makiIcons";

export interface MapProps {
    searchResponse: ApiSearchResponse;
    entities: ResultEntity[] | null;
    means: {
        byFoot: boolean;
        byBike: boolean;
        byCar: boolean;
    }
}

const Map = React.memo<MapProps>(({searchResponse, entities, means}) => {
    const {mapBoxAccessToken} = useContext(ConfigContext);
    const [zoom, setZoom] = useState(15);
    
    const {lat, lng} = searchResponse.centerOfInterest.coordinates;
    const [position, setPosition] = useState<L.LatLngExpression>([lat, lng]);
    const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    const url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    const derivePositionForTransportationMean = (profile: MeansOfTransportation) => {
        return searchResponse.routingProfiles[profile].isochrone.features[0].geometry.coordinates[0].map((item: number[]) => {
            return [item[1], item[0]];
        });
    }

    const [map, setMap]  = useState<L.Map>();

    useEffect(() => {
        if (map !== undefined) {
            map.off();
            map.remove();
        }
        const localMap = L.map('mymap', {
            scrollWheelZoom: false,
            preferCanvas: true,
            renderer: new L.Canvas(),
            tap: false
        }).setView(position, zoom);
        localMap.addEventListener("zoom", (value) => {
            setZoom(value.target._zoom)
        });
        localMap.addEventListener("dragend", (value) => {
            setPosition(value.target.getCenter());
        })

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

        entities?.forEach(entity => {
            const icon = new L.Icon({
                iconUrl: osmNameToIcons.find(entry => entry.name === entity.type)?.icon || fallbackIcon,
                shadowUrl: leafletShadow,
                shadowSize: [0,0],
                iconSize: new L.Point(25, 25),
                className: entity.type
            });
            L.marker(entity.coordinates, {
                icon,
            }).on('click', function(e) {
                const marker = e.target;
                marker.bindPopup(`${entity.name || 'Name nicht bekannt'}`);
                marker.openPopup();
            }).addTo(localMap);
        });

        setMap(localMap);
    }, [searchResponse, entities, means]);

    return (
        <div className="leaflet-container" id="mymap">
        </div>
    )
});

export default Map;

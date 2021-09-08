import {FunctionComponent, useContext, useState} from "react";
import {CircleMarker, MapContainer, Marker, Polygon, Popup, TileLayer, useMapEvents} from 'react-leaflet';
import {LatLngExpression} from "leaflet";
import "./Map.css";
import {ApiSearchResponse, MeansOfTransportation} from "../../../shared/types/types";
import {ConfigContext} from "../context/ConfigContext";
import {ResultEntity} from "../search/SearchResult";

export interface MapProps {
    searchResponse: ApiSearchResponse;
    entities: ResultEntity[] | null;
    means: {
        byFoot: boolean;
        byBike: boolean;
        byCar: boolean;
    }
}

const Map: FunctionComponent<MapProps> = ({searchResponse, entities, means}) => {
    const {mapBoxAccessToken} = useContext(ConfigContext);

    const { lat, lng } = searchResponse.centerOfInterest.coordinates;
    const position : LatLngExpression = [lat, lng];

    const zoom : number = 15;

    const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    const url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    const LocationMarker = ({ entity } : { entity: ResultEntity }) => {
        const [radius, setRadius] = useState(2);
        const map = useMapEvents({
            zoomend() {
                setRadius(map.getZoom() > 16 ? 10 : map.getZoom() > 14 ? 6 : 4);
            }
        })
        const { lat, lng} = entity.coordinates;
        const locationPosition: LatLngExpression = [lat, lng];

        return (
            <CircleMarker center={locationPosition} radius={radius} pathOptions={{color: 'black'}}>
                <Popup>
                    <b>{ entity.name }</b><br />
                    <span>{ entity.label}</span><br />
                    <span>{ entity.address ? JSON.stringify(entity.address) : '' }</span>
                </Popup>
            </CircleMarker>
        )
    }

    const derivePositionForTransportationMean = (profile: MeansOfTransportation) => {
        return searchResponse.routingProfiles[profile].isochrone.features[0].geometry.coordinates[0].map((item: number[]) => {
            return [item[1], item[0]];
        });
    }

    return (
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={true}>
            <TileLayer
                attribution={attribution}
                url={url}
                zoomOffset={-1}
                maxZoom={18}
                id="mapbox/light-v10"
                tileSize={512}
                accessToken={mapBoxAccessToken}
            />
            { means.byFoot && <Polygon pathOptions={{ color: 'blue' }} positions={derivePositionForTransportationMean(MeansOfTransportation.WALK)} /> }
            { means.byBike && <Polygon pathOptions={{ color: 'green' }} positions={derivePositionForTransportationMean(MeansOfTransportation.BICYCLE)} /> }
            { means.byCar && <Polygon pathOptions={{ color: 'gray' }} positions={derivePositionForTransportationMean(MeansOfTransportation.CAR)} /> }
            <Marker position={position}>
                <Popup>
                    Mein Standort
                </Popup>
            </Marker>
            {entities?.map(entity => {
                   return <LocationMarker entity={entity} key={entity.id}/>
                }
            )}
        </MapContainer>
    )
}

export default Map;

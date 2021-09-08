import {FunctionComponent, useContext, useState} from "react";
import {MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents, Polygon, Rectangle} from 'react-leaflet';
import {LatLngBoundsExpression, LatLngExpression} from "leaflet";
import "./Map.css";
import {ApiOsmLocation, ApiSearchResponse} from "../../../shared/types/types";
import {ConfigContext} from "../context/ConfigContext";

export interface MapProps {
    searchResponse: ApiSearchResponse;
};

const Map: FunctionComponent<MapProps> = ({searchResponse}) => {
    const {mapBoxAccessToken} = useContext(ConfigContext);

    const { lat, lng } = searchResponse.centerOfInterest.coordinates;
    const position : LatLngExpression = [lat, lng];

    const zoom : number = 15;

    const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    const url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    const LocationMarker = ({ location } : { location: ApiOsmLocation}) => {
        const [radius, setRadius] = useState(2);
        const map = useMapEvents({
            zoomend() {
                setRadius(map.getZoom() > 16 ? 10 : map.getZoom() > 14 ? 6 : 4);
            }
        })
        const { lat, lng} = location.coordinates;
        const locationPosition: LatLngExpression = [lat, lng];

        return (
            <CircleMarker center={locationPosition} radius={radius} pathOptions={{color: 'black'}}>
                <Popup>
                    <b>{ location.entity.name }</b><br />
                    <span>{ location.entity.label}</span><br />
                    <span>{ location.address ? JSON.stringify(location.address) : '' }</span>
                </Popup>
            </CircleMarker>
        )
    }

    const inTimePositions = searchResponse.routingProfiles.BICYCLE.isochrone.features[0].geometry.coordinates[0].map((item: number[]) => {
        return [item[1], item[0]];
    });
    const inHalfTimePositions = searchResponse.routingProfiles.BICYCLE.isochrone.features[1].geometry.coordinates[0].map((item: number[]) => {
        return [item[1], item[0]];
    });

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
            <Polygon pathOptions={{ color: 'green' }} positions={inTimePositions} />
            <Polygon pathOptions={{ color: 'blue' }} positions={inHalfTimePositions} />
            <Marker position={position}>
                <Popup>
                    Mein Standort
                </Popup>
            </Marker>
            {searchResponse.routingProfiles.BICYCLE.locationsOfInterest.map(location =>
                <LocationMarker location={location} key={location.entity.id} />
            )}
        </MapContainer>
    )
}

export default Map;

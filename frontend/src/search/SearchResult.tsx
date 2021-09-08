import React, {FunctionComponent, useState} from "react";
import {ApiAddress, ApiCoordinates, ApiSearchResponse, MeansOfTransportation, UnitsOfTransportation} from "../../../shared/types/types";
import Map from "../map/Map";

export interface SearchResultProps {
    searchResponse: ApiSearchResponse,
}

export interface ResultEntity {
    name?: string;
    type: string;
    label: string;
    id: number;
    coordinates: ApiCoordinates;
    address: ApiAddress;
    byFoot: boolean;
    byBike: boolean;
    byCar: boolean;
    distanceInMeters: number;
}

const buildEntityData = (locationSearchResult: ApiSearchResponse): ResultEntity[] | null => {
    if (!locationSearchResult) {
        return null;
    }
    const allLocations = Object.values(locationSearchResult.routingProfiles)
        .map((a) =>
            a.locationsOfInterest.sort((a, b) => a.distanceInMeters - b.distanceInMeters)).flat();
    const allLocationIds = new Set(allLocations.map(location => location.entity.id));
    return Array.from(allLocationIds).map(locationId => {
        const location = allLocations.find(l => l.entity.id === locationId)!;
        return {
            id: parseInt(locationId!, 10),
            name: location.entity.name,
            label: location.entity.label,
            type: location.entity.type,
            distanceInMeters: location.distanceInMeters,
            coordinates: location.coordinates,
            address: location.address,
            byFoot: locationSearchResult!.routingProfiles.WALK?.locationsOfInterest?.some(l => l.entity.id === locationId) ?? false,
            byBike: locationSearchResult!.routingProfiles.BICYCLE?.locationsOfInterest?.some(l => l.entity.id === locationId) ?? false,
            byCar: locationSearchResult!.routingProfiles.CAR?.locationsOfInterest?.some(l => l.entity.id === locationId) ?? false
        }
    });
}

const SearchResult: FunctionComponent<SearchResultProps> = ({searchResponse}) => {

    const routingKeys = Object.keys(searchResponse.routingProfiles);
    const byFootAvailable = routingKeys.includes(MeansOfTransportation.WALK);
    const byBikeAvailable = routingKeys.includes(MeansOfTransportation.BICYCLE);
    const byCarAvailable = routingKeys.includes(MeansOfTransportation.CAR);

    const [byFoot, setByFoot] = useState(byFootAvailable);
    const [byBike, setByBike] = useState(byBikeAvailable);
    const [byCar, setByCar] = useState(byCarAvailable);
    const entities = buildEntityData(searchResponse);
    const mapMeans = {
        byFoot,
        byBike,
        byCar
    }
    const filterEntities = () => {
        return entities!.filter(entity => {
            return (entity.byFoot && mapMeans.byFoot) || (entity.byBike && mapMeans.byBike) || (entity.byCar && mapMeans.byCar);
        })
    }
    return (
        <>
            <div className="flex gap-6 mt-10">
                { byFootAvailable && <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox text-blue-500"
                        checked={byFoot}
                        onChange={(e) => {
                            setByFoot(e.target.checked);
                        }}
                    />
                    <span className="ml-2">zu Fuß</span>
                </label> }
                { byBikeAvailable && <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={byBike}
                        className="form-checkbox text-green-500"
                        onChange={(e) => {
                            setByBike(e.target.checked);
                        }}
                    />
                    <span className="ml-2">Fahrrad</span>
                </label> }
                { byCarAvailable && <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox text-gray-500"
                        checked={byCar}
                        onChange={(e) => {
                            setByCar(e.target.checked);
                        }}
                    />
                    <span className="ml-2">Auto</span>
                </label> }
            </div>
            <Map searchResponse={searchResponse} entities={filterEntities()} means={mapMeans}/>
        </>
    )
}

export default SearchResult;

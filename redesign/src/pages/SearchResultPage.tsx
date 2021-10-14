import React, {useContext, useEffect, useState} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {SearchContext} from "../context/SearchContext";
import {ApiAddress, ApiCoordinates, ApiSearchResponse, MeansOfTransportation} from "../../../shared/types/types";
import Map, {defaultMapZoom} from "../map/Map";
import MapNavBar from "../map/MapNavBar";
import {meansOfTransportations} from "../../../shared/constants/constants";

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
    selected: boolean;
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
            byCar: locationSearchResult!.routingProfiles.CAR?.locationsOfInterest?.some(l => l.entity.id === locationId) ?? false,
            selected: false
        }
    });
}

const SearchResultPage: React.FunctionComponent = () => {
    const {searchContextState} = useContext(SearchContext);

    const routingKeys = Object.keys(searchContextState.searchResponse!.routingProfiles);
    const availableMeans = meansOfTransportations.filter(mot => routingKeys.includes(mot.type)).map(mot => mot.type);
    const [activeMeans, setActiveMeans] = useState([...availableMeans]);


    const [filteredEntites, setFilteredEntities] = useState<ResultEntity[]>([]);
    const [showCensus, setShowCensus] = useState(false);
    const censusDataAvailable = !!searchContextState.censusData?.length;

    const searchResponseString = JSON.stringify(searchContextState.searchResponse);
    useEffect(() => {
        const entities = buildEntityData(JSON.parse(searchResponseString));
        if (entities) {
            setFilteredEntities((entities));
        }
    }, [searchResponseString])


    return (
        <DefaultLayout title="Umgebungsanalyse" withHorizontalPadding={false}>
            <div className="relative">
                <MapNavBar activeMeans={activeMeans} availableMeans={availableMeans} onChange={(newValues) => setActiveMeans(newValues)}/>
                <Map
                    searchResponse={searchContextState.searchResponse}
                    entities={filteredEntites}
                    means={{
                        byFoot: activeMeans.includes(MeansOfTransportation.WALK),
                        byBike: activeMeans.includes(MeansOfTransportation.BICYCLE),
                        byCar: activeMeans.includes(MeansOfTransportation.CAR)
                    }}
                    selectedCenter={searchContextState.location}
                    selectedZoomLevel={defaultMapZoom}
                    printingActive={false}
                    censusData={showCensus && searchContextState.censusData}
                />
            </div>
        </DefaultLayout>
    )
}
export default SearchResultPage;

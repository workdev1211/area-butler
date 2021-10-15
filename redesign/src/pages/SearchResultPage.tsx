import React, {useContext, useEffect, useState} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {SearchContext} from "../context/SearchContext";
import {
    ApiAddress,
    ApiCoordinates,
    ApiSearchResponse,
    MeansOfTransportation,
    OsmName
} from "../../../shared/types/types";
import Map, {defaultMapZoom} from "../map/Map";
import MapNavBar from "../map/MapNavBar";
import {meansOfTransportations} from "../../../shared/constants/constants";
import {ApiPreferredLocation} from "../../../shared/types/potential-customer";
import {distanceInMeters} from "../../../frontend/src/shared/shared.functions";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {useHistory} from "react-router-dom";

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

const preferredLocationsTitle = 'Wichtige Adressen';
const buildEntityDataFromPreferredLocations = (
    centerCoordinates: ApiCoordinates,
    preferredLocations: ApiPreferredLocation[]
): ResultEntity[] => {
    return preferredLocations
        .filter((preferredLocation) => !!preferredLocation.coordinates)
        .map((preferredLocation) => ({
            id: parseInt(preferredLocation.title, 10),
            name: `${preferredLocation.title} (${preferredLocation.address})`,
            label: preferredLocationsTitle,
            type: OsmName.favorite,
            distanceInMeters: distanceInMeters(
                centerCoordinates,
                preferredLocation.coordinates!
            ), // Calc distance
            coordinates: preferredLocation.coordinates!,
            address: {street: preferredLocation.address},
            byFoot: true,
            byBike: true,
            byCar: true,
            selected: false
        }));
};

const realEstateListingsTitle = 'Meine Objekte';
const buildEntityDataFromRealEstateListings = (
    centerCoordinates: ApiCoordinates,
    realEstateListings: ApiRealEstateListing[]
): ResultEntity[] => {
    return realEstateListings
        .filter((realEstateListing) => !!realEstateListing.coordinates)
        .map((realEstateListing) => ({
            id: parseInt(realEstateListing.name, 10),
            name: `${realEstateListing.name} (${realEstateListing.address})`,
            label: realEstateListingsTitle,
            type: OsmName.property,
            distanceInMeters: distanceInMeters(
                centerCoordinates,
                realEstateListing.coordinates!
            ), // Calc distance
            coordinates: realEstateListing.coordinates!,
            address: {street: realEstateListing.address},
            byFoot: true,
            byBike: true,
            byCar: true,
            selected: false
        }));
};

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
    const history = useHistory();
    if (!searchContextState.searchResponse) {
        history.push("/");
    }

    const routingKeys = Object.keys(searchContextState.searchResponse!.routingProfiles);
    const availableMeans = meansOfTransportations.filter(mot => routingKeys.includes(mot.type)).map(mot => mot.type);
    const [activeMeans, setActiveMeans] = useState([...availableMeans]);
    const [showPreferredlocations, setShowPreferredLocations] = useState(true);
    const [showMyObjects, setShowMyObjects] = useState(true);


    const [filteredEntites, setFilteredEntities] = useState<ResultEntity[]>([]);
    const [showCensus, setShowCensus] = useState(false);
    const censusDataAvailable = !!searchContextState.censusData?.length;

    const searchResponseString = JSON.stringify(searchContextState.searchResponse);
    useEffect(() => {
        const searchResponseParsed = JSON.parse(searchResponseString);
        const centerOfSearch = searchResponseParsed.centerOfInterest.coordinates;
        const entities = buildEntityData(searchResponseParsed);
        if (!!searchContextState.preferredLocations && showPreferredlocations) {
            entities?.push(...buildEntityDataFromPreferredLocations(centerOfSearch, searchContextState.preferredLocations));
        }
        if (!!searchContextState.realEstateListings && showMyObjects) {
            entities?.push(...buildEntityDataFromRealEstateListings(centerOfSearch, searchContextState.realEstateListings));
        }
        if (entities) {
            setFilteredEntities((entities));
        }
    }, [searchResponseString, showPreferredlocations, searchContextState.preferredLocations, showMyObjects, searchContextState.realEstateListings])


    return (
        <DefaultLayout title="Umgebungsanalyse" withHorizontalPadding={false}>
            <div className="relative">
                <MapNavBar activeMeans={activeMeans} availableMeans={availableMeans}
                           onMeansChange={(newValues) => setActiveMeans(newValues)}
                           showPreferredLocations={showPreferredlocations}
                           onToggleShowPreferredLocations={(active) => setShowPreferredLocations(active)}
                           showMyObjects={showMyObjects}
                           onToggleShowMyObjects={(active) => setShowMyObjects(active)}
                />
                <Map
                    searchResponse={searchContextState.searchResponse}
                    entities={filteredEntites}
                    means={{
                        byFoot: activeMeans.includes(MeansOfTransportation.WALK),
                        byBike: activeMeans.includes(MeansOfTransportation.BICYCLE),
                        byCar: activeMeans.includes(MeansOfTransportation.CAR)
                    }}
                    mapCenter={searchContextState.mapCenter ?? searchContextState.location}
                    mapZoomLevel={searchContextState.mapZoomLevel ?? defaultMapZoom}
                    printingActive={searchContextState.printingActive}
                    censusData={showCensus && searchContextState.censusData}
                />
            </div>
        </DefaultLayout>
    )
}
export default SearchResultPage;

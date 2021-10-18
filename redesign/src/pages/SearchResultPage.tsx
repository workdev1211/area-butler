import React, {useContext, useEffect, useState} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {SearchContext, SearchContextActions} from "../context/SearchContext";
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
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {useHistory} from "react-router-dom";
import MapMenu from "../map/MapMenu";
import {distanceInMeters} from "shared/shared.functions";
import "./SearchResultPage.css";
import backIcon from "../assets/icons/icons-16-x-16-outline-ic-back.svg";

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

export interface EntityGroups {
    title: string;
    active: boolean;
    items: ResultEntity[];
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
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);
    const history = useHistory();
    if (!searchContextState.searchResponse?.routingProfiles) {
        history.push("/");
    }

    const routingKeys = Object.keys(searchContextState.searchResponse!.routingProfiles);
    const availableMeans = meansOfTransportations.filter(mot => routingKeys.includes(mot.type)).map(mot => mot.type);
    const [activeMeans, setActiveMeans] = useState([...availableMeans]);
    const [showPreferredlocations, setShowPreferredLocations] = useState(true);
    const [showMyObjects, setShowMyObjects] = useState(true);


    const [filteredEntites, setFilteredEntities] = useState<ResultEntity[]>([]);
    const [groupedEntries, setGroupedEntries] = useState<EntityGroups[]>([]);
    const [showCensus, setShowCensus] = useState(false);
    const censusDataAvailable = !!searchContextState.censusData?.length;

    const searchResponseString = JSON.stringify(searchContextState.searchResponse);
    useEffect(() => {
        const searchResponseParsed = JSON.parse(searchResponseString);
        const centerOfSearch = searchResponseParsed.centerOfInterest.coordinates;
        let entities = buildEntityData(searchResponseParsed);
        if (!!searchContextState.preferredLocations && showPreferredlocations) {
            entities?.push(...buildEntityDataFromPreferredLocations(centerOfSearch, searchContextState.preferredLocations));
        }
        if (!!searchContextState.realEstateListings && showMyObjects) {
            entities?.push(...buildEntityDataFromRealEstateListings(centerOfSearch, searchContextState.realEstateListings));
        }
        if (entities) {
            setFilteredEntities((entities));
            // eslint-disable-next-line no-sequences
            const groupBy = (xs: any, f: any): Record<string, any> => xs.reduce((r: any, v: any, i: any, a: any, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
            const newGroupedEntries: any[] = Object.entries(groupBy(entities, (item: ResultEntity) => item.label));

            const combinedGroupEntries = [
                {
                    title: preferredLocationsTitle,
                    active: true,
                    items: [...newGroupedEntries.filter(([label, _]) => label === preferredLocationsTitle)]
                },
                {
                    title: realEstateListingsTitle,
                    active: true,
                    items: [...newGroupedEntries.filter(([label, _]) => label === realEstateListingsTitle)]
                },
                ...newGroupedEntries.filter(([label, _]) => label !== preferredLocationsTitle && label !== realEstateListingsTitle).map(([title, items]) => ({
                    title,
                    active: true,
                    items
                }))
            ]

            setGroupedEntries(combinedGroupEntries);
        }

    }, [searchResponseString, showPreferredlocations, searchContextState.preferredLocations, showMyObjects, searchContextState.realEstateListings])

    const toggleEntityGroup = (title: string) => {
        const newGroups = groupedEntries.map(ge => ge.title !== title ? ge : {
            ...ge,
            active: !ge.active
        });
        setGroupedEntries(newGroups);
    }

    const highlightZoomEntity = (item: ResultEntity) => {
            searchContextDispatch({type: SearchContextActions.CENTER_ZOOM_COORDINATES, payload: {center: item.coordinates, zoom: 18 }});
            searchContextDispatch({type: SearchContextActions.SET_HIGHLIGHT_ID, payload: item.id});
    }

    const ActionsTop: React.FunctionComponent = () => {
        return (<>
            <li>
                <a href="/">Item 1</a>
            </li>
            <li>
                <a href="/">Item 2</a>
            </li>
            <li>
                <a href="/">Item 3</a>
            </li>
        </>)
    }

    const BackButton: React.FunctionComponent = () => {
        const history = useHistory();
        return (<button type="button" className="btn bg-primary-gradient w-full sm:w-auto mr-auto" onClick={() => history.push('/')}><img className="mr-1 -mt-0.5" src={backIcon} alt="icon-back"/> Zurück</button>)
    }

    return (
        <DefaultLayout title="Umgebungsanalyse" withHorizontalPadding={false} actionTop={<ActionsTop />} actionBottom={[<BackButton />]}>
            <div className="search-result-container">
                <div className="relative flex-1">
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
                        groupedEntities={groupedEntries}
                        highlightId={searchContextState.highlightId}
                        means={{
                            byFoot: activeMeans.includes(MeansOfTransportation.WALK),
                            byBike: activeMeans.includes(MeansOfTransportation.BICYCLE),
                            byCar: activeMeans.includes(MeansOfTransportation.CAR)
                        }}
                        mapCenter={searchContextState.mapCenter ?? searchContextState.location}
                        mapZoomLevel={searchContextState.mapZoomLevel ?? defaultMapZoom}
                        printingActive={searchContextState.printingActive}
                        censusData={showCensus && censusDataAvailable && searchContextState.censusData}
                    />
                </div>
                <MapMenu census={showCensus} toggleCensus={(active) => setShowCensus(active)}
                         groupedEntries={groupedEntries} toggleEntryGroup={toggleEntityGroup} highlightZoomEntity={highlightZoomEntity}/>
            </div>
        </DefaultLayout>
    )
}
export default SearchResultPage;

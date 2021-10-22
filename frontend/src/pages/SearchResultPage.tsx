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
import ExportModal from "export/ExportModal";
import pdfIcon from "../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import openMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-menu.svg";
import closeMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-close.svg";
import BackButton from "../layout/BackButton";
import {RealEstateContext} from "context/RealEstateContext";
import {ApiRoute} from "../../../shared/types/routing";
import {useRouting} from "../hooks/routing";
import {v4} from "uuid";

export interface ResultEntity {
    name?: string;
    type: string;
    label: string;
    id: string;
    coordinates: ApiCoordinates;
    address: ApiAddress;
    byFoot: boolean;
    byBike: boolean;
    byCar: boolean;
    distanceInMeters: number;
    selected?: boolean;
}

export interface EntityGroup {
    title: string;
    active: boolean;
    items: ResultEntity[];
}

export interface EntityRoute {
    coordinates: ApiCoordinates,
    show: boolean,
    routes: ApiRoute[]
}

const preferredLocationsTitle = 'Wichtige Adressen';
const buildEntityDataFromPreferredLocations = (
    centerCoordinates: ApiCoordinates,
    preferredLocations: ApiPreferredLocation[]
): ResultEntity[] => {
    return preferredLocations
        .filter((preferredLocation) => !!preferredLocation.coordinates)
        .map((preferredLocation) => ({
            id: v4(),
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
            id: v4(),
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
            id: locationId!,
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
    const {fetchRoutes} = useRouting();
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);
    const {realEstateState} = useContext(RealEstateContext);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const [groupedEntries, setGroupedEntries] = useState<EntityGroup[]>([]);
    const [routes, setRoutes] = useState<EntityRoute[]>([])
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
        if (!!realEstateState.listings && showMyObjects) {
            entities?.push(...buildEntityDataFromRealEstateListings(centerOfSearch, realEstateState.listings));
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
                    items: newGroupedEntries.filter(([label, _]) => label === preferredLocationsTitle).map(([label, items]) => items).flat()
                },
                {
                    title: realEstateListingsTitle,
                    active: true,
                    items: newGroupedEntries.filter(([label, _]) => label === realEstateListingsTitle).map(([label, items]) => items).flat()
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
        searchContextDispatch({
            type: SearchContextActions.CENTER_ZOOM_COORDINATES,
            payload: {center: item.coordinates, zoom: 18}
        });
        searchContextDispatch({type: SearchContextActions.SET_HIGHLIGHT_ID, payload: item.id});
    }

    const toggleRoutesToEntity = async (origin: ApiCoordinates, item: ResultEntity) => {
        const existing = routes.find((r) => r.coordinates.lat === item.coordinates.lat && r.coordinates.lng === item.coordinates.lng);
        if (existing) {
            setRoutes((prevState) => [...prevState.filter(r => r.coordinates.lat !== item.coordinates.lat && r.coordinates.lng !== item.coordinates.lng),{...existing, show: !existing.show}]
            )
        } else {
            const routesResult = await fetchRoutes({
                meansOfTransportation: [MeansOfTransportation.BICYCLE, MeansOfTransportation.CAR, MeansOfTransportation.WALK],
                origin: origin,
                destinations: [{
                    title: item.name || ''+item.id,
                    coordinates: item.coordinates
                }]
            })
            setRoutes((prev) =>([...prev, {
                routes: routesResult[0].routes,
                show: true,
                coordinates: item.coordinates
            }]));
        }
    }

    const ActionsTop: React.FunctionComponent = () => {
        return (<>
            <li>
                <button
                    type="button"
                    onClick={() => {
                        searchContextDispatch({type: SearchContextActions.SET_PRINTING_ACTIVE, payload: true});
                    }}
                    className="btn btn-link"
                >
                    <img src={pdfIcon} alt="pdf-icon"/> Umgebungsanalyse PDF
                </button>
            </li>
            <li>
                <button
                    type="button"
                    onClick={() => {
                        searchContextDispatch({type: SearchContextActions.SET_PRINTING_CHEATSHEET_ACTIVE, payload: true});
                    }}
                    className="btn btn-link"
                >
                    <img src={pdfIcon} alt="pdf-icon"/> Spickzettel PDF
                </button>
            </li>
        </>)
    }

    const MapMenuMobileBtn: React.FunctionComponent = () => {
        return (
            <button type="button" className="mobile-menu-btn" onMouseDown={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {!mobileMenuOpen && <img src={openMenuIcon} alt="icon-menu" />}
                {mobileMenuOpen && <img src={closeMenuIcon} alt="icon-menu-close" />}
            </button>
        );
    }

    return (
        <>
            <DefaultLayout title="Umgebungsanalyse" withHorizontalPadding={false} actionTop={<ActionsTop/>}
                           actionBottom={[<BackButton key="back-button" to="/"/>]}>
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
                            printingCheatsheetActive={searchContextState.printingCheatsheetActive}
                            censusData={showCensus && censusDataAvailable && searchContextState.censusData}
                            routes={routes}
                        />
                    </div>
                    <MapMenuMobileBtn />
                    <MapMenu mobileMenuOpen={mobileMenuOpen}
                             census={showCensus}
                             toggleCensus={(active) => setShowCensus(active)}
                             groupedEntries={groupedEntries}
                             toggleEntryGroup={toggleEntityGroup}
                             highlightZoomEntity={highlightZoomEntity}
                             toggleRoute={(item) => toggleRoutesToEntity(searchContextState.location, item)}
                             routes={routes}
                    />
                </div>
            </DefaultLayout>
            {searchContextState.printingActive && <ExportModal entities={filteredEntites} groupedEntries={groupedEntries}
                         censusData={searchContextState.censusData!}/>}
            {searchContextState.printingCheatsheetActive && <ExportModal entities={filteredEntites} groupedEntries={groupedEntries}
                         censusData={searchContextState.censusData!} exportType="CHEATSHEET"/>}
        </>
    )
}
export default SearchResultPage;

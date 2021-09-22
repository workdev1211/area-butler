import React, {FunctionComponent, useContext, useState} from "react";
import {ApiAddress, ApiCoordinates, ApiSearchResponse, MeansOfTransportation} from "../../../shared/types/types";
import Map from "../map/Map";
import ResultTable from "./ResultTable";
import {SearchContext} from "../context/SearchContext";
import {fallbackIcon, osmNameToIcons} from "../map/makiIcons";

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

const SearchResult: FunctionComponent = () => {

    const {searchContextState} = useContext(SearchContext);

    const routingKeys = Object.keys(searchContextState.searchResponse!.routingProfiles);
    const byFootAvailable = routingKeys.includes(MeansOfTransportation.WALK);
    const byBikeAvailable = routingKeys.includes(MeansOfTransportation.BICYCLE);
    const byCarAvailable = routingKeys.includes(MeansOfTransportation.CAR);

    const [byFoot, setByFoot] = useState(byFootAvailable);
    const [byBike, setByBike] = useState(byBikeAvailable);
    const [byCar, setByCar] = useState(byCarAvailable);
    const entities = buildEntityData(searchContextState.searchResponse!);
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
    // eslint-disable-next-line no-sequences
    const groupBy = (xs: any, f: any): Record<string, any> => xs.reduce((r: any, v: any, i: any, a: any, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
    const [activeTab, setActiveTab] = useState(0);
    const groupedEntries = Object.entries(groupBy(filterEntities(), (item: ResultEntity) => item.label));
    return (
        <>
            <div className="flex gap-6 mt-10">
                { byFootAvailable && <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
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
                        className="checkbox checkbox-xs checkbox-accent"
                        onChange={(e) => {
                            setByBike(e.target.checked);
                        }}
                    />
                    <span className="ml-2">Fahrrad</span>
                </label> }
                { byCarAvailable && <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={byCar}
                        onChange={(e) => {
                            setByCar(e.target.checked);
                        }}
                    />
                    <span className="ml-2">Auto</span>
                </label> }
            </div>
            <Map searchResponse={searchContextState.searchResponse!} entities={filterEntities()} means={mapMeans}/>
            <div className="flex-col gap-6 mt-5">
                <div className="tabs">
                {groupedEntries.map(([label, data], index) => {
                    const type = data[0].type;
                    const classes = (index === activeTab) ? 'tab tab-lifted tab-active' : 'tab tab-lifted';
                    return (
                            <button type="button" onClick={() => setActiveTab(index)} className={classes} key={'tab-' + label}>
                                <img alt="icon" style={{marginRight: '4px'}} src={osmNameToIcons.find(entry => entry.name === type)?.icon || fallbackIcon} className={type}/>
                                {label} ({data.slice(0, 10).length})
                            </button>
                        );
                })}
                </div>
                {groupedEntries.map(([label, data], index) => {
                    if (index === activeTab) {
                        return (
                            <div className="mt-5" key={'tab-content-' + label}>
                                <ResultTable title={label} data={data} />
                            </div>
                        );
                    }
                    return (<div key={'tab-content-' + label}></div>);
                })}
            </div>
        </>
    )
}

export default SearchResult;

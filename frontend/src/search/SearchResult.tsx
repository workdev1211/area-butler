import { RealEstateListingContext } from "context/RealEstateListingContext";
import ExposeDownloadButton from "pdf-export/ExposeDownloadButton";
import { ExposeModal } from "pdf-export/ExposeModal";
import React, { FunctionComponent, useContext, useEffect, useState } from "react";
import { distanceInMeters } from "shared/shared.functions";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { ApiAddress, ApiCoordinates, ApiSearchResponse, MeansOfTransportation, OsmName } from "../../../shared/types/types";
import { SearchContext } from "../context/SearchContext";
import { fallbackIcon, osmNameToIcons } from "../map/makiIcons";
import Map, {defaultMapZoom} from "../map/Map";
import ResultTable from "./ResultTable";

const preferredLocationsTitle = 'Wichtige Adressen';
const realEstateListingsTitle = 'Meine Objekte';

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
      address: { street: preferredLocation.address },
      byFoot: true,
      byBike: true,
      byCar: true,
      selected: true
    }));
};

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
        address: { street: realEstateListing.address },
        byFoot: true,
        byBike: true,
        byCar: true,
        selected: true
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
            selected: true
        }
    });
}

const SearchResult: FunctionComponent = () => {

    const {searchContextState} = useContext(SearchContext);
    const { realEstateListingState } = useContext(RealEstateListingContext);

    const routingKeys = Object.keys(searchContextState.searchResponse!.routingProfiles);
    const byFootAvailable = routingKeys.includes(MeansOfTransportation.WALK);
    const byBikeAvailable = routingKeys.includes(MeansOfTransportation.BICYCLE);
    const byCarAvailable = routingKeys.includes(MeansOfTransportation.CAR);
    const censusDataAvailable = !!searchContextState.censusData?.length;

    const [byFoot, setByFoot] = useState(byFootAvailable);
    const [byBike, setByBike] = useState(byBikeAvailable);
    const [byCar, setByCar] = useState(byCarAvailable);
    const [showCensus, setShowCensus] = useState(false);
    const [myListings, setMyListings] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [groupedEntries, setGroupedEntries] = useState<any[]>([]);
    const [filteredEntites, setFilteredEntities] = useState<ResultEntity[]>([]);

    const mapMeans = {
      byFoot,
      byBike,
      byCar,
  }

    useEffect(() => {
      const entities = buildEntityData(searchContextState.searchResponse!);
      const centerCoordinates = searchContextState.searchResponse.centerOfInterest.coordinates;

      if (!!searchContextState.preferredLocations) {
          entities?.push(...buildEntityDataFromPreferredLocations(centerCoordinates, searchContextState.preferredLocations));
      }
  
      if (!!realEstateListingState.listings && myListings) {
          entities?.push(...buildEntityDataFromRealEstateListings(centerCoordinates, realEstateListingState.listings));
      }
  

      const filterEntities = () => {
          return entities!.filter(entity => {
              return (entity.byFoot && mapMeans.byFoot) || (entity.byBike && mapMeans.byBike) || (entity.byCar && mapMeans.byCar);
          })
      }
      setFilteredEntities(filterEntities());
  
      // eslint-disable-next-line no-sequences
      const groupBy = (xs: any, f: any): Record<string, any> => xs.reduce((r: any, v: any, i: any, a: any, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
      
      const newGroupedEntries : any[] = Object.entries(groupBy(filteredEntites, (item: ResultEntity) => item.label));

      setGroupedEntries([
          ...newGroupedEntries.filter(([label, _]) => label === preferredLocationsTitle),
          ...newGroupedEntries.filter(([label, _]) => label === realEstateListingsTitle),
          ...newGroupedEntries.filter(([label, _]) => label !== preferredLocationsTitle && label !== realEstateListingsTitle)
      ].map(([label, data] : any) => [label, data.slice(0, 10)]));

    }, [JSON.stringify(searchContextState.searchResponse)]);


    const changeEntitySelection = (title: string, row: ResultEntity) => {
      const newGroupedEntries = [...groupedEntries];
      const entityGroup = newGroupedEntries.find(([label, data]) => label === title);
      const existingRow : ResultEntity  = entityGroup[1].find((e: ResultEntity) => e.id === row.id)!;
      existingRow.selected = !existingRow.selected;
      setGroupedEntries(newGroupedEntries);
    }

    return (
      <>
        <ExposeModal
          entities={filteredEntites}
          groupedEntries={groupedEntries}
        ></ExposeModal>
        <div className="flex gap-6 mt-10">
          {byFootAvailable && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-xs checkbox-primary"
                checked={byFoot}
                onChange={(e) => {
                  setByFoot(e.target.checked);
                }}
              />
              <span className="ml-2">zu Fuß</span>
            </label>
          )}
          {byBikeAvailable && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={byBike}
                className="checkbox checkbox-xs checkbox-accent"
                onChange={(e) => {
                  setByBike(e.target.checked);
                }}
              />
              <span className="ml-2">Fahrrad</span>
            </label>
          )}
          {byCarAvailable && (
            <label className="flex items-center">
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={byCar}
                onChange={(e) => {
                  setByCar(e.target.checked);
                }}
              />
              <span className="ml-2">Auto</span>
            </label>
          )}
          {
            <label className="flex items-center">
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={myListings}
                onChange={(e) => {
                  setMyListings(e.target.checked);
                }}
              />
              <span className="ml-2">Meine Objekte</span>
            </label>
          }
          {censusDataAvailable && (
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={showCensus}
                        onChange={(e) => {
                            setShowCensus(e.target.checked);
                        }}
                    />
                    <span className="ml-2">Zensus Atlas</span>
                </label>
            )}
        </div>
        <Map
          searchResponse={searchContextState.searchResponse!}
          censusData={showCensus && searchContextState.censusData!}
          entities={filteredEntites}
          means={mapMeans}
          selectedCenter={searchContextState.printingActive ? searchContextState.selectedCenter : searchContextState.searchResponse.centerOfInterest.coordinates}
          selectedZoomLevel={searchContextState.printingActive ? searchContextState.selectedZoomLevel : defaultMapZoom}
          printingActive={searchContextState.printingActive}
        />
        <div className="flex-col gap-6 mt-5">
          <div className="tabs">
            {groupedEntries.map(([label, data], index) => {
              const type = data[0].type;
              const classes =
                index === activeTab
                  ? "tab tab-lifted tab-active"
                  : "tab tab-lifted";
              return (
                <button
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={classes}
                  key={"tab-" + label}
                >
                  <img
                    alt="icon"
                    style={{ marginRight: "4px" }}
                    src={
                      osmNameToIcons.find((entry) => entry.name === type)
                        ?.icon || fallbackIcon
                    }
                    className={type}
                  />
                  {label} ({data.slice(0, 10).length})
                </button>
              );
            })}
          </div>
          {groupedEntries.map(([label, data], index) => {
            if (index === activeTab) {
              return (
                <div className="mt-5" key={"tab-content-" + label}>
                  <ResultTable title={label} data={data} dataSelectable={true} changeEntitySelection={changeEntitySelection} />
                </div>
              );
            }
            return <div key={"tab-content-" + label}></div>;
          })}
        </div>
      </>
    );
}

export default SearchResult;

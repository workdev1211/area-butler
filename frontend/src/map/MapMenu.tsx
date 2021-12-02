import React, { useEffect, useState } from "react";
import "./MapMenu.css";
import {
  EntityGroup,
  EntityRoute,
  EntityTransitRoute,
  ResultEntity
} from "../pages/SearchResultPage";
import positionIcon from "../assets/icons/icons-16-x-16-outline-ic-position.svg";
import distanceIcon from "../assets/icons/icons-32-x-32-illustrated-ic-distance.svg";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import {
  ApiGeojsonFeature,
  ApiOsmEntityCategory,
  ApiUser,
  OsmName
} from "../../../shared/types/types";
import {
  deriveIconForOsmName,
  preferredLocationsIcon,
  preferredLocationsTitle,
  realEstateListingsIcon,
  realEstateListingsTitle
} from "../shared/shared.functions";
import LocalityItem from "../components/LocalityItem";
import { ApiDataSource } from "../../../shared/types/subscription-plan";
import MapMenuCollapsable from "./MapMenuCollapsable";
import CensusTable from "./CensusTable";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import FederalElectionTable from "./FederalElectionTable";
import ParticlePollutionTable from "./ParticlePollutionTable";
import { osmEntityTypes } from "../../../shared/constants/constants";
import { MapClipping } from "context/SearchContext";
import MapClippingsCollapsable from "./MapClippingsCollapsable";
import { CensusData } from "hooks/censusdata";

export interface MapMenuProps {
  censusData?: CensusData[];
  federalElectionData?: FederalElectionDistrict;
  groupedEntries: EntityGroup[];
  particlePollutionData?: ApiGeojsonFeature[];
  clippings: MapClipping[];
  toggleEntryGroup: (title: string) => void;
  toggleAllEntryGroups: () => void;
  highlightZoomEntity: (item: ResultEntity) => void;
  mobileMenuOpen: boolean;
  toggleRoute: (item: ResultEntity) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  searchAddress: string;
  resetPosition: () => void;
  user: ApiUser;
  openUpgradeSubscriptionModal: (message: React.ReactNode) => void;
}

const localityPaginationSize = 5;
const censusNotInSubscriptionPlanMessage = (
  <div>
    <p className="my-5">
      Der Zensus Atlas ist in Ihrem aktuellen Abonnement nicht verfügbar.
    </p>
    <p className="my-5">
      Der Zensus Atlas beinhaltet ökonomische und soziale Daten zB:
      <br />
      <ul className="list-disc ml-5 mt-5">
        <li key="Bevölkerungsdichte">Bevölkerungsdichte</li>
        <li key="Durchschnittsalter">Durchschnittsalter</li>
        <li key="Wohnfläche">Durchschnittliche Wohnfläche pro Wohnung</li>
        <li key="uvm">u.v.m.</li>
      </ul>
    </p>
    <p className="my-5">
      So erhalten Sie einen detaillierten Einblick in die direkte
      Objektumgebung.
    </p>
  </div>
);

const federalElectionNotInSubscriptionPlanMessage = (
  <div>
    <p className="my-5">
      Die Ergebnisse der Bundestagswahl sind in Ihrem aktuellen Abonnement nicht
      verfügbar.
    </p>
  </div>
);

const MapMenu: React.FunctionComponent<MapMenuProps> = ({
  censusData,
  federalElectionData,
  particlePollutionData,
  clippings = [],
  groupedEntries,
  toggleEntryGroup,
  toggleAllEntryGroups,
  highlightZoomEntity,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mobileMenuOpen,
  searchAddress,
  resetPosition,
  user,
  openUpgradeSubscriptionModal
}) => {
  const [viewOptionsOpen, setViewOptionsOpen] = useState(true);
  const [mapClippingsOpen, setMapClippingsOpen] = useState(false);
  const [localitiesOpen, setLocalitiesOpen] = useState(true);
  const [localityOpen, setLocalityOpen] = useState<string[]>([]);
  const [localityPagination, setLocalityPagination] = useState<number[]>(
    groupedEntries.map(() => localityPaginationSize)
  );

  const allLocalitiesActive = groupedEntries.some(ge => ge.active);

  const toggleLocality = (title: string) => {
    const filtered = [...localityOpen.filter(l => l !== title)];
    if (!localityOpen.some(l => l === title)) {
      filtered.push(title);
    }
    setLocalityOpen(filtered);
  };

  const mobileMenuButtonClasses = `map-menu ${
    mobileMenuOpen ? "mobile-open" : ""
  }`;
  const censusInSubscriptionPlan = user?.subscriptionPlan?.config.appFeatures.dataSources.includes(
    ApiDataSource.CENSUS
  )!;

  const federalElectionInSubscriptionPlan = user?.subscriptionPlan?.config.appFeatures.dataSources.includes(
    ApiDataSource.FEDERAL_ELECTION
  )!;

  const particlePollutionInSubscriptionPlan = user?.subscriptionPlan?.config.appFeatures.dataSources.includes(
    ApiDataSource.PARTICLE_POLLUTION
  )!;

  useEffect(() => {
    if (Array.isArray(groupedEntries)) {
      setLocalityPagination(groupedEntries.map(() => localityPaginationSize));
    }
  }, [groupedEntries, setLocalityPagination]);

  interface MapMenuListItemProps {
    ge: EntityGroup;
    groupIconInfo: any;
    geIndex: number;
  }

  const MapMenuListItem: React.FunctionComponent<MapMenuListItemProps> = ({
    ge,
    groupIconInfo,
    geIndex
  }) => {
    return (
      <li
        className="locality-option-li"
        key={`grouped-entry-${ge.title}-${geIndex}`}
      >
        <div
          className={
            "collapse collapse-arrow locality-option" +
            (localityOpen.includes(ge.title)
              ? " collapse-child-open"
              : " collapse-child-closed")
          }
        >
          <input type="checkbox" onChange={() => toggleLocality(ge.title)} />
          <div className="collapse-title">
            <div onClick={() => toggleLocality(ge.title)}>
              <div
                className="img-container"
                style={{ background: groupIconInfo.color }}
              >
                <img
                  src={groupIconInfo.icon}
                  alt="group-icon"
                  onClick={() => toggleLocality(ge.title)}
                />
              </div>
              {ge.title} [{ge.items.length}]
            </div>
            <label className="cursor-pointer label justify-start pl-0">
              <input
                type="checkbox"
                checked={ge.active}
                className="checkbox checkbox-primary checkbox-sm"
                onChange={() => toggleEntryGroup(ge.title)}
              />
            </label>
          </div>
          <div className="collapse-content">
            <div className="mean-items">
              <div className="item">
                <img src={distanceIcon} alt="icon-distance" />
                Distanz
              </div>
              <div className="item">
                <img src={walkIcon} alt="icon-walk" />
                Fußweg
              </div>
              <div className="item">
                <img src={bicycleIcon} alt="icon-bicycle" />
                Fahrrad
              </div>
              <div className="item">
                <img src={carIcon} alt="icon-car" />
                Auto
              </div>
            </div>
            {localityOpen.includes(ge.title) &&
              ge.items
                .slice(0, localityPagination[geIndex])
                .map((item, index) => (
                  <LocalityItem
                    key={`${ge.title}-${index}`}
                    item={item}
                    group={ge}
                    onClickTitle={item => highlightZoomEntity(item)}
                    onToggleRoute={item => toggleRoute(item)}
                    route={routes?.find(
                      r =>
                        r.coordinates.lat === item.coordinates.lat &&
                        r.coordinates.lng === item.coordinates.lng &&
                        r.show
                    )}
                    onToggleTransitRoute={item => toggleTransitRoute(item)}
                    transitRoute={transitRoutes?.find(
                      tr =>
                        tr.coordinates.lat === item.coordinates.lat &&
                        tr.coordinates.lng === item.coordinates.lng &&
                        tr.show
                    )}
                  />
                ))}
            {localityOpen.includes(ge.title) &&
              ge.items.length > localityPagination[geIndex] && (
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() =>
                    setLocalityPagination(
                      localityPagination.map((lp, index) =>
                        index !== geIndex ? lp : lp + localityPaginationSize
                      )
                    )
                  }
                >
                  Mehr anzeigen
                </button>
              )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className={mobileMenuButtonClasses} data-tour="map-menu">
      <div className="heading">
        <span className="heading">Ergebnisse</span>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => resetPosition()}
          data-tour="reset-position"
        >
          <img className="mr-1" src={positionIcon} alt="icon-position" />
          {searchAddress}
        </button>
      </div>
      {clippings.length > 0 && (<div
        className={
          "collapse collapse-arrow view-option" +
          (mapClippingsOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <input
          type="checkbox"
          onChange={(event) => setMapClippingsOpen(event.target.checked)}
        />
        <div className="collapse-title">Kartenausschnitte</div>
        <div className="collapse-content">
          <MapClippingsCollapsable searchAddress={searchAddress} clippings={clippings} />
        </div>
      </div>)}
      <div
        className={
          "collapse collapse-arrow view-option" +
          (viewOptionsOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <input
          type="checkbox"
          onChange={(event) => setViewOptionsOpen(event.target.checked)}
        />
        <div className="collapse-title">Einblicke</div>
        <div className="collapse-content">
          <ul>
            <li className="locality-option-li" key="list-item-zensus">
              <MapMenuCollapsable
                title="Zensus Atlas"
                subscriptionCheck={() => censusInSubscriptionPlan}
                openUpgradeSubcriptionModal={() =>
                  openUpgradeSubscriptionModal(
                    censusNotInSubscriptionPlanMessage
                  )
                }
              >
                <CensusTable censusData={censusData!} />
              </MapMenuCollapsable>
            </li>
            <li className="locality-option-li" key="list-item-btw">
              <MapMenuCollapsable
                title="Bundestagswahl 2021"
                subscriptionCheck={() => federalElectionInSubscriptionPlan}
                openUpgradeSubcriptionModal={() =>
                  openUpgradeSubscriptionModal(
                    federalElectionNotInSubscriptionPlanMessage
                  )
                }
              >
                <FederalElectionTable
                  federalElectionData={federalElectionData!}
                />
              </MapMenuCollapsable>
            </li>
            <li className="locality-option-li" key="list-item-zensus-feinstaub">
              <MapMenuCollapsable
                title="Feinstaubbelastung"
                subscriptionCheck={() => particlePollutionInSubscriptionPlan}
                openUpgradeSubcriptionModal={() =>
                  openUpgradeSubscriptionModal(
                    particlePollutionInSubscriptionPlan
                  )
                }
              >
                <ParticlePollutionTable
                  particlePollutionData={particlePollutionData!}
                />
              </MapMenuCollapsable>
            </li>
          </ul>
        </div>
      </div>
      <div
        className={
          "collapse collapse-arrow view-option" +
          (localitiesOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <input
          type="checkbox"
          onChange={(event) => setLocalitiesOpen(event.target.checked)}
        />
        <div className="collapse-title flex justify-between">
          Lokalitäten
          <label className="cursor-pointer label justify-start pl-0">
            <input
              type="checkbox"
              checked={allLocalitiesActive}
              className="checkbox checkbox-white checkbox-sm z-2500"
              onChange={toggleAllEntryGroups}
            />
          </label>
        </div>
        <div className="collapse-content">
          <ul>
            {groupedEntries
              .filter(
                (ge) =>
                  ge.items.length &&
                  ["Wichtige Adressen", "Meine Objekte"].includes(ge.title)
              )
              .map((ge, geIndex) => {
                const isRealEstateListing =
                  ge.items[0].label === realEstateListingsTitle;
                const isPreferredLocation =
                  ge.items[0].label === preferredLocationsTitle;
                const groupIconInfo = isRealEstateListing
                  ? realEstateListingsIcon
                  : isPreferredLocation
                  ? preferredLocationsIcon
                  : deriveIconForOsmName(ge.items[0].type as OsmName);
                return (
                  <MapMenuListItem
                    ge={ge}
                    groupIconInfo={groupIconInfo}
                    geIndex={geIndex}
                    key={`${ge.title}-${geIndex}-map-menu-list-item-top`}
                  />
                );
              })}
            {Object.entries(ApiOsmEntityCategory)
              .sort()
              .map(([_, category]) => {
                return (
                  <div key={`container-${category}`}>
                    {groupedEntries.some(
                      (ge) =>
                        ge.items.length &&
                        osmEntityTypes.some(
                          (oet) =>
                            oet.label === ge.title && oet.category === category
                        )
                    ) && (
                      <li className="locality-option-heading" key={category}>
                        <h4>{category}</h4>
                      </li>
                    )}
                    {groupedEntries
                      .filter(
                        (ge) =>
                          ge.items.length &&
                          osmEntityTypes.some(
                            (oet) =>
                              oet.label === ge.title &&
                              oet.category === category
                          )
                      )
                      .sort()
                      .map((ge, geIndex) => {
                        const isRealEstateListing =
                          ge.items[0].label === realEstateListingsTitle;
                        const isPreferredLocation =
                          ge.items[0].label === preferredLocationsTitle;
                        const groupIconInfo = isRealEstateListing
                          ? realEstateListingsIcon
                          : isPreferredLocation
                          ? preferredLocationsIcon
                          : deriveIconForOsmName(ge.items[0].type as OsmName);
                        return (
                          <MapMenuListItem
                            ge={ge}
                            groupIconInfo={groupIconInfo}
                            geIndex={geIndex}
                            key={`${ge.title}-${geIndex}-map-menu-list-item`}
                          />
                        );
                      })}
                  </div>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapMenu;

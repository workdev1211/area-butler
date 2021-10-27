import React, { useEffect, useState } from "react";
import "./MapMenu.css";
import {
  EntityGroup,
  EntityRoute,
  ResultEntity,
} from "../pages/SearchResultPage";
import positionIcon from "../assets/icons/icons-16-x-16-outline-ic-position.svg";
import distanceIcon from "../assets/icons/icons-32-x-32-illustrated-ic-distance.svg";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import { ApiUser, OsmName } from "../../../shared/types/types";
import {
  deriveIconForOsmName,
  preferredLocationsIcon,
  preferredLocationsTitle,
  realEstateListingsIcon,
  realEstateListingsTitle,
} from "../shared/shared.functions";
import LocalityItem from "../components/LocalityItem";
import { ApiDataSource } from "../../../shared/types/subscription-plan";

export interface MapMenuProps {
  census: boolean;
  toggleCensus: (active: boolean) => void;
  groupedEntries: EntityGroup[];
  toggleEntryGroup: (title: string) => void;
  highlightZoomEntity: (item: ResultEntity) => void;
  mobileMenuOpen: boolean;
  toggleRoute: (item: ResultEntity) => void;
  routes: EntityRoute[];
  searchAddress: string;
  resetPosition: () => void;
  user: ApiUser;
  openUpgradeSubcriptionModal: (message: React.ReactNode) => void;
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
        <li>Bevölkerungsdichte</li>
        <li>Durchschnittsalter</li>
        <li>Durchschnittliche Wohnfläche pro Wohnung</li>
        <li>u.v.m.</li>
      </ul>
    </p>
    <p className="my-5">
      So erhalten Sie einen detaillierten Einblick in die direkte
      Objektumgebung.
    </p>
  </div>
);

const MapMenu: React.FunctionComponent<MapMenuProps> = ({
  census,
  toggleCensus,
  groupedEntries,
  toggleEntryGroup,
  highlightZoomEntity,
  toggleRoute,
  routes,
  mobileMenuOpen,
  searchAddress,
  resetPosition,
  user,
  openUpgradeSubcriptionModal,
}) => {
  const [viewOptionsOpen, setViewOptionsOpen] = useState(true);
  const [localitiesOpen, setLocalitiesOpen] = useState(true);
  const [localityOpen, setLocalityOpen] = useState<string[]>([]);
  const [localityPagination, setLocalityPagination] = useState<number[]>(
    groupedEntries.map(() => localityPaginationSize)
  );



  const toggleLocality = (title: string, open: boolean) => {
    const filtered = [...localityOpen.filter((l) => l !== title)];
    if (open) {
      filtered.push(title);
    }
    setLocalityOpen(filtered);
  };

  const mobileMenuButtonClasses = `map-menu ${
    mobileMenuOpen ? "mobile-open" : ""
  }`;
    const censusInSubscriptionPlan = user.subscriptionPlan?.config?.appFeatures.dataSources.includes(ApiDataSource.CENSUS);

  useEffect(() => {
    if (Array.isArray(groupedEntries)) {
      setLocalityPagination(groupedEntries.map(() => localityPaginationSize));
    }
  }, [groupedEntries, setLocalityPagination]);

  return (
    <div className={mobileMenuButtonClasses}>
      <div className="heading">
        <span className="heading">Ergebnisse</span>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => resetPosition()}
        >
          <img className="mr-1" src={positionIcon} alt="icon-position" />
          {searchAddress}
        </button>
      </div>
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
        <div className="collapse-title">Anzeigeoptionen</div>
        <div className="collapse-content">
          <ul>
            <li>
              <span>Zensus Atlas</span>
              <label className="cursor-pointer label justify-start pl-0">
                <input
                  type="checkbox"
                  checked={census}
                  className="checkbox checkbox-primary checkbox-sm"
                  onChange={(event) =>
                    censusInSubscriptionPlan
                      ? toggleCensus(event.target.checked)
                      : openUpgradeSubcriptionModal(
                          censusNotInSubscriptionPlanMessage
                        )
                  }
                />
              </label>
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
        <div className="collapse-title">Lokalitäten</div>
        <div className="collapse-content">
          <ul>
            {groupedEntries
              .filter((ge) => ge.items.length)
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
                  <li
                    className="locality-option-li"
                    key={`grouped-entry-${ge.title}`}
                  >
                    <div
                      className={
                        "collapse collapse-arrow locality-option" +
                        (localityOpen.includes(ge.title)
                          ? " collapse-child-open"
                          : " collapse-child-closed")
                      }
                    >
                      <input
                        type="checkbox"
                        onChange={(event) =>
                          toggleLocality(ge.title, event.target.checked)
                        }
                      />
                      <div className="collapse-title">
                        <div
                          onClick={() =>
                            toggleLocality(
                              ge.title,
                              !localityOpen.includes(ge.title)
                            )
                          }
                        >
                          <div
                            className="img-container"
                            style={{ background: groupIconInfo.color }}
                          >
                            <img
                              src={groupIconInfo.icon}
                              alt="group-icon"
                              onClick={() =>
                                toggleLocality(ge.title, !ge.active)
                              }
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
                                key={index}
                                item={item}
                                group={ge}
                                onClickTitle={(item) =>
                                  highlightZoomEntity(item)
                                }
                                onToggleRoute={(item) => toggleRoute(item)}
                                route={routes?.find(
                                  (r) =>
                                    r.coordinates.lat ===
                                      item.coordinates.lat &&
                                    r.coordinates.lng ===
                                      item.coordinates.lng &&
                                    r.show
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
                                    index !== geIndex
                                      ? lp
                                      : lp + localityPaginationSize
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
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapMenu;

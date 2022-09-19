import { FunctionComponent, ReactNode, useState } from "react";

import "./MapMenu.scss";
import {
  EntityGroup,
  ResultEntity,
} from "../../components/SearchResultContainer";
import positionIcon from "../../assets/icons/icons-16-x-16-outline-ic-position.svg";
import {
  ApiGeojsonFeature,
  ApiOsmEntityCategory,
  ApiSearchResultSnapshotConfig,
  ApiUser,
  IApiUserPoiIcon,
  MeansOfTransportation,
  OsmName,
} from "../../../../shared/types/types";
import {
  deriveIconForOsmName,
  getPreferredLocationsIcon,
  preferredLocationsTitle,
  getRealEstateListingsIcon,
  realEstateListingsTitle,
} from "../../shared/shared.functions";
import { ApiDataSource } from "../../../../shared/types/subscription-plan";
import MapMenuCollapsable from "./menu-collapsable/MapMenuCollapsable";
import CensusTable from "./data/CensusTable";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import FederalElectionTable from "./data/FederalElectionTable";
import ParticlePollutionTable from "./data/ParticlePollutionTable";
import { osmEntityTypes } from "../../../../shared/constants/constants";
import { MapClipping } from "context/SearchContext";
import MapClippingsCollapsable from "./clippings/MapClippingsCollapsable";
import { CensusData } from "hooks/censusdata";
import MapMenuKarlaFricke from "./karla-fricke/MapMenuKarlaFricke";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../shared/types/routing";
import MapMenuListItem from "./menu-item/MapMenuListItem";
import { IPoiIcon } from "../../shared/shared.types";

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

export interface MapMenuProps {
  censusData?: CensusData[];
  federalElectionData?: FederalElectionDistrict;
  groupedEntries: EntityGroup[];
  toggleAllLocalities: () => void;
  particlePollutionData?: ApiGeojsonFeature[];
  clippings: MapClipping[];
  mobileMenuOpen: boolean;
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  searchAddress: string;
  resetPosition: () => void;
  user?: ApiUser;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  showInsights?: boolean;
  config?: ApiSearchResultSnapshotConfig;
  isShownPreferredLocationsModal: boolean;
  togglePreferredLocationsModal: (isShown: boolean) => void;
  userPoiIcons?: IApiUserPoiIcon[];
}

const MapMenu: FunctionComponent<MapMenuProps> = ({
  censusData,
  federalElectionData,
  particlePollutionData,
  clippings = [],
  groupedEntries,
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mobileMenuOpen,
  searchAddress,
  resetPosition,
  user,
  openUpgradeSubscriptionModal,
  showInsights = true,
  config,
  isShownPreferredLocationsModal,
  togglePreferredLocationsModal,
  userPoiIcons,
}) => {
  const [viewOptionsOpen, setViewOptionsOpen] = useState(true);
  const [mapClippingsOpen, setMapClippingsOpen] = useState(false);
  const [localitiesOpen, setLocalitiesOpen] = useState(true);

  const mobileMenuButtonClasses = `map-menu ${
    mobileMenuOpen ? "mobile-open" : ""
  }`;

  const hasCensusData =
    user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.CENSUS
    )!;

  const hasElectionData =
    user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.FEDERAL_ELECTION
    )!;

  const hasPollutionData =
    user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.PARTICLE_POLLUTION
    )!;

  if (config?.theme) {
    switch (config?.theme) {
      case "KF":
        return (
          <MapMenuKarlaFricke
            groupedEntries={groupedEntries
              .filter(
                (ge) => ge.items.length && ge.title !== realEstateListingsTitle
              )
              .sort((a, b) => (a.title > b.title ? 1 : -1))}
            mobileMenuOpen={false}
            isShownPreferredLocationsModal={isShownPreferredLocationsModal}
            togglePreferredLocationsModal={togglePreferredLocationsModal}
            userPoiIcons={userPoiIcons}
          />
        );
      default:
    }
  }

  const background = config?.primaryColor || "var(--primary-gradient)";

  return (
    <div className={mobileMenuButtonClasses} data-tour="map-menu">
      <div className="heading">
        <span className="heading">Ergebnisse</span>
        {(!!config?.showAddress || !config) && (
          <button
            type="button"
            className="btn btn-link"
            onClick={() => resetPosition()}
            data-tour="reset-position"
          >
            <img className="mr-1" src={positionIcon} alt="icon-position" />
            {searchAddress}
          </button>
        )}
      </div>
      {clippings.length > 0 && (
        <div
          className={
            "collapse collapse-arrow view-option" +
            (mapClippingsOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <input
            type="checkbox"
            onChange={(event) => setMapClippingsOpen(event.target.checked)}
          />
          <div
            className="collapse-title"
            ref={(node) => {
              if (!!node) {
                if (node.parentElement?.classList.contains("collapse-open")) {
                  node.style.setProperty("background", background, "important");
                } else {
                  node.style.setProperty("background", "#FFFFFF", "important");
                }
              }
            }}
          >
            Kartenausschnitte
          </div>
          <div className="collapse-content">
            <MapClippingsCollapsable
              searchAddress={searchAddress}
              clippings={clippings}
            />
          </div>
        </div>
      )}
      {showInsights && (
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
          <div
            className="collapse-title"
            ref={(node) => {
              if (!!node) {
                if (node.parentElement?.classList.contains("collapse-open")) {
                  node.style.setProperty("background", background, "important");
                } else {
                  node.style.setProperty("background", "#FFFFFF", "important");
                }
              }
            }}
          >
            Einblicke
          </div>
          <div className="collapse-content">
            <ul>
              <li className="locality-option-li" key="list-item-zensus">
                <MapMenuCollapsable
                  title="Zensus Atlas"
                  subscriptionCheck={() => hasCensusData}
                  openUpgradeSubcriptionModal={() => {
                    openUpgradeSubscriptionModal &&
                      openUpgradeSubscriptionModal(
                        censusNotInSubscriptionPlanMessage
                      );
                  }}
                >
                  <CensusTable censusData={censusData!} />
                </MapMenuCollapsable>
              </li>
              <li className="locality-option-li" key="list-item-btw">
                <MapMenuCollapsable
                  title="Bundestagswahl 2021"
                  subscriptionCheck={() => hasElectionData}
                  openUpgradeSubcriptionModal={() => {
                    openUpgradeSubscriptionModal &&
                      openUpgradeSubscriptionModal(
                        federalElectionNotInSubscriptionPlanMessage
                      );
                  }}
                >
                  <FederalElectionTable
                    federalElectionData={federalElectionData!}
                  />
                </MapMenuCollapsable>
              </li>
              <li
                className="locality-option-li"
                key="list-item-zensus-feinstaub"
              >
                <MapMenuCollapsable
                  title="Feinstaubbelastung"
                  subscriptionCheck={() => hasPollutionData}
                  openUpgradeSubcriptionModal={() => {
                    openUpgradeSubscriptionModal &&
                      openUpgradeSubscriptionModal(hasPollutionData);
                  }}
                >
                  <ParticlePollutionTable
                    particlePollutionData={particlePollutionData!}
                  />
                </MapMenuCollapsable>
              </li>
            </ul>
          </div>
        </div>
      )}
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
        <div
          className="collapse-title flex justify-between"
          ref={(node) => {
            if (!!node) {
              if (node.parentElement?.classList.contains("collapse-open")) {
                node.style.setProperty("background", background, "important");
              } else {
                node.style.setProperty("background", "#FFFFFF", "important");
              }
            }
          }}
        >
          Lokalitäten
          <label className="cursor-pointer label justify-start pl-0">
            <input
              type="checkbox"
              checked={!groupedEntries.some((e) => !e.active)}
              className="checkbox checkbox-white checkbox-sm z-2500"
              onChange={() => toggleAllLocalities()}
            />
          </label>
        </div>
        <div className="collapse-content">
          <ul>
            {/*Estates and important objects*/}
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

                const groupIconInfo: IPoiIcon = isRealEstateListing
                  ? !!config?.mapIcon
                    ? { icon: config.mapIcon, color: "transparent" }
                    : getRealEstateListingsIcon(userPoiIcons)
                  : isPreferredLocation
                  ? getPreferredLocationsIcon(userPoiIcons)
                  : deriveIconForOsmName(
                      ge.items[0].type as OsmName,
                      userPoiIcons
                    );

                return (
                  <MapMenuListItem
                    entityGroup={ge}
                    groupIcon={groupIconInfo}
                    entityGroupIndex={geIndex}
                    isCustomIcon={
                      (isRealEstateListing && !!config?.mapIcon) ||
                      groupIconInfo.isCustom
                    }
                    routes={routes}
                    toggleRoute={toggleRoute}
                    transitRoutes={transitRoutes}
                    toggleTransitRoute={toggleTransitRoute}
                    config={config}
                    key={`${ge.title}-${geIndex}-map-menu-list-item-top`}
                  />
                );
              })}
            {/*POIs*/}
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

                        const groupIconInfo: IPoiIcon = isRealEstateListing
                          ? getRealEstateListingsIcon(userPoiIcons)
                          : isPreferredLocation
                          ? getPreferredLocationsIcon(userPoiIcons)
                          : deriveIconForOsmName(
                              ge.items[0].type as OsmName,
                              userPoiIcons
                            );

                        return (
                          <MapMenuListItem
                            entityGroup={ge}
                            groupIcon={groupIconInfo}
                            isCustomIcon={groupIconInfo.isCustom}
                            entityGroupIndex={geIndex}
                            config={config}
                            routes={routes}
                            toggleRoute={toggleRoute}
                            transitRoutes={transitRoutes}
                            toggleTransitRoute={toggleTransitRoute}
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

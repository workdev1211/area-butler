import { FunctionComponent, ReactNode, useState } from "react";

import {
  EntityGroup,
  ResultEntity,
} from "../../../components/SearchResultContainer";
import {
  ApiGeojsonFeature,
  ApiOsmEntityCategory,
  ApiSearchResultSnapshotConfig,
  ApiUser,
  IApiUserPoiIcon,
  MeansOfTransportation,
  OsmName,
} from "../../../../../shared/types/types";
import {
  deriveIconForOsmName,
  getPreferredLocationsIcon,
  preferredLocationsTitle,
  getRealEstateListingsIcon,
  realEstateListingsTitle,
  setBackgroundColor,
} from "../../../shared/shared.functions";
import { ApiDataSource } from "../../../../../shared/types/subscription-plan";
import MapMenuCollapsable from "./../menu-collapsable/MapMenuCollapsable";
import CensusTable from "./../data/CensusTable";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import FederalElectionTable from "./../data/FederalElectionTable";
import ParticlePollutionTable from "./../data/ParticlePollutionTable";
import { osmEntityTypes } from "../../../../../shared/constants/constants";
import { MapClipping } from "context/SearchContext";
import MapClippingsCollapsable from "./../clippings/MapClippingsCollapsable";
import { CensusData } from "hooks/censusdata";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import MapMenuListItem from "./../menu-item/MapMenuListItem";
import { IPoiIcon } from "../../../shared/shared.types";

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

interface IMapTabProps {
  groupedEntries: EntityGroup[];
  toggleAllLocalities: () => void;
  clippings: MapClipping[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  searchAddress: string;
  user?: ApiUser;
  config?: ApiSearchResultSnapshotConfig;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  showInsights?: boolean;
  censusData?: CensusData[];
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  userPoiIcons?: IApiUserPoiIcon[];
}

const MapTab: FunctionComponent<IMapTabProps> = ({
  groupedEntries,
  toggleAllLocalities,
  clippings = [],
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  searchAddress,
  user,
  config,
  openUpgradeSubscriptionModal,
  showInsights = true,
  censusData,
  federalElectionData,
  particlePollutionData,
  userPoiIcons,
}) => {
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(true);
  const [isMapClippingsOpen, setIsMapClippingsOpen] = useState(false);
  const [isLocalitiesOpen, setIsLocalitiesOpen] = useState(true);

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

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
    <div className="map-tab z-9000">
      {clippings.length > 0 && (
        <div
          className={
            "collapse collapse-arrow-1 view-option" +
            (isMapClippingsOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsMapClippingsOpen(!isMapClippingsOpen);
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
            (isViewOptionsOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsViewOptionsOpen(!isViewOptionsOpen);
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
                  openUpgradeSubscriptionModal={() => {
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
                  openUpgradeSubscriptionModal={() => {
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
                  openUpgradeSubscriptionModal={() => {
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
          (isLocalitiesOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <div
          className="collapse-title flex justify-between collapse-primary-white"
          ref={(node) => {
            setBackgroundColor(node, backgroundColor);
          }}
          onClick={() => {
            setIsLocalitiesOpen(!isLocalitiesOpen);
          }}
        >
          Lokalitäten
          <label className="cursor-pointer label justify-start pl-0">
            <input
              type="checkbox"
              checked={groupedEntries.some((e) => e.active)}
              className="checkbox checkbox-white checkbox-sm z-2500"
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={toggleAllLocalities}
            />
          </label>
        </div>

        <div className="collapse-content">
          <ul>
            {/* Estates and important objects */}
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
                    isCustomIcon={
                      (isRealEstateListing && !!config?.mapIcon) ||
                      groupIconInfo.isCustom
                    }
                    entityGroupIndex={geIndex}
                    routes={routes}
                    toggleRoute={toggleRoute}
                    transitRoutes={transitRoutes}
                    toggleTransitRoute={toggleTransitRoute}
                    config={config}
                    key={`${ge.title}-${geIndex}-map-menu-list-item-top`}
                  />
                );
              })}

            {/* POIs */}
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

export default MapTab;

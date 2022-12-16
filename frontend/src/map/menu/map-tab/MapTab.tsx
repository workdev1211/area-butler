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
import { TCensusData } from "hooks/censusdata";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import MapMenuListItem from "./../menu-item/MapMenuListItem";
import { IPoiIcon } from "../../../shared/shared.types";
import localitiesIcon from "../../../assets/icons/map-menu/01-lokalitäten.svg";
import socialDemographicsIcon from "../../../assets/icons/map-menu/02-soziales-und-demographie.svg";
import environmentalInfoIcon from "../../../assets/icons/map-menu/03-umweltinformationen.svg";
import locationIndicesIcon from "../../../assets/icons/map-menu/11-lageindizes.svg";
import economicMetricsIcon from "../../../assets/icons/map-menu/12-wirtschaftliche-kennzahlen.svg";
import censusDataIcon from "../../../assets/icons/census-data.svg";
import federalElectionIcon from "../../../assets/icons/federal-election.svg";
import particlePollutionIcon from "../../../assets/icons/particle-pollution.svg";
import { getCombinedOsmEntityTypes } from "../../../../../shared/functions/shared.functions";
import { TLocationIndexData } from "../../../hooks/locationindexdata";
import LocationIndexTable from "../data/LocationIndexTable";

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
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  user?: ApiUser;
  config?: ApiSearchResultSnapshotConfig;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  showInsights?: boolean;
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  locationIndexData?: TLocationIndexData;
  userPoiIcons?: IApiUserPoiIcon[];
  editorMode?: boolean;
}

const MapTab: FunctionComponent<IMapTabProps> = ({
  groupedEntries,
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  user,
  config,
  openUpgradeSubscriptionModal,
  showInsights = true,
  censusData,
  federalElectionData,
  particlePollutionData,
  locationIndexData,
  userPoiIcons = user?.poiIcons,
  editorMode = false,
}) => {
  const [isLocalitiesOpen, setIsLocalitiesOpen] = useState(false);
  const [isSocialDemographicsOpen, setIsSocialDemographicsOpen] =
    useState(false);
  const [isEnvironmentalInfoOpen, setIsEnvironmentalInfoOpen] = useState(false);
  const [isLocationIndicesOpen, setIsLocationIndicesOpen] = useState(false);
  const [isEconomicMetricsOpen, setIsEconomicMetricsOpen] = useState(false);

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
      <div
        className={
          "collapse collapse-arrow view-option" +
          (isLocalitiesOpen ? " collapse-open" : " collapse-closed")
        }
      >
        <div
          className="collapse-title justify-between collapse-primary-white"
          ref={(node) => {
            setBackgroundColor(node, backgroundColor);
          }}
          onClick={() => {
            setIsLocalitiesOpen(!isLocalitiesOpen);
          }}
        >
          <div className="collapse-title-container">
            <img src={localitiesIcon} alt="localities-icon" />
            <div className="collapse-title-text">
              <div className="collapse-title-text-1">Lokalitäten</div>
              <div className="collapse-title-text-2">Was ist in der Nähe?</div>
            </div>
          </div>
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
                  : deriveIconForOsmName(ge.items[0].osmName, userPoiIcons);

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
            {Object.entries(ApiOsmEntityCategory).map(([_, category]) => {
              return (
                <div key={`container-${category}`}>
                  {groupedEntries.some(
                    (ge) =>
                      ge.items.length &&
                      getCombinedOsmEntityTypes().some(
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
                        getCombinedOsmEntityTypes().some(
                          (oet) =>
                            oet.label === ge.title && oet.category === category
                        )
                    )
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
                            ge.items[0].osmName,
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

      {editorMode && (
        <div
          className={
            "collapse collapse-arrow view-option" +
            (isLocationIndicesOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsLocationIndicesOpen(!isLocationIndicesOpen);
            }}
          >
            <div className="collapse-title-container">
              <img src={locationIndicesIcon} alt="location-indices-icon" />
              <div className="collapse-title-text">
                <div className="collapse-title-text-1 flex gap-2">
                  <span>Lageindizes</span>{" "}
                  <span
                    className={`badge ${
                      isLocationIndicesOpen ? "badge-accent" : "badge-primary"
                    }`}
                  >
                    NEU
                  </span>
                </div>
                <div className="collapse-title-text-2">
                  Die Nachbarschaft im Vergleich?
                </div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            <LocationIndexTable locationIndexData={locationIndexData} />
          </div>
        </div>
      )}

      {showInsights && editorMode && (
        <div
          className={
            "collapse collapse-arrow view-option" +
            (isSocialDemographicsOpen ? " collapse-open" : " collapse-closed")
          }
        >
          <div
            className="collapse-title"
            ref={(node) => {
              setBackgroundColor(node, backgroundColor);
            }}
            onClick={() => {
              setIsSocialDemographicsOpen(!isSocialDemographicsOpen);
            }}
          >
            <div className="collapse-title-container">
              <img
                src={socialDemographicsIcon}
                alt="social-demographics-icon"
              />
              <div className="collapse-title-text">
                <div className="collapse-title-text-1">
                  Soziales und Demographie
                </div>
                <div className="collapse-title-text-2">Wer lebt hier?</div>
              </div>
            </div>
          </div>
          <div className="collapse-content">
            <ul>
              <li className="locality-option-li" key="list-item-zensus">
                <MapMenuCollapsable
                  title="Zensus Daten"
                  icon={censusDataIcon}
                  subscriptionCheck={() => hasCensusData}
                  openUpgradeSubscriptionModal={() => {
                    openUpgradeSubscriptionModal &&
                      openUpgradeSubscriptionModal(
                        censusNotInSubscriptionPlanMessage
                      );
                  }}
                >
                  <CensusTable censusData={censusData} />
                </MapMenuCollapsable>
              </li>
              <li className="locality-option-li" key="list-item-btw">
                <MapMenuCollapsable
                  title="Bundestagswahlen"
                  icon={federalElectionIcon}
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
            </ul>
          </div>
        </div>
      )}

      {editorMode && (
        <>
          <div
            className={
              "collapse collapse-arrow view-option" +
              (isEnvironmentalInfoOpen ? " collapse-open" : " collapse-closed")
            }
          >
            <div
              className="collapse-title"
              ref={(node) => {
                setBackgroundColor(node, backgroundColor);
              }}
              onClick={() => {
                setIsEnvironmentalInfoOpen(!isEnvironmentalInfoOpen);
              }}
            >
              <div className="collapse-title-container">
                <img
                  src={environmentalInfoIcon}
                  alt="environmental-info-icon"
                />
                <div className="collapse-title-text">
                  <div className="collapse-title-text-1">
                    Umweltinformationen
                  </div>
                  <div className="collapse-title-text-2">Wie lebt es sich?</div>
                </div>
              </div>
            </div>
            <div className="collapse-content">
              <ul>
                <li
                  className="locality-option-li"
                  key="list-item-zensus-feinstaub"
                >
                  <MapMenuCollapsable
                    title="Feinstaubbelastung"
                    icon={particlePollutionIcon}
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

          <div
            className={
              "collapse collapse-arrow view-option" +
              (isEconomicMetricsOpen ? " collapse-open" : " collapse-closed")
            }
          >
            <div
              className="collapse-title"
              ref={(node) => {
                setBackgroundColor(node, backgroundColor);
              }}
              onClick={() => {
                setIsEconomicMetricsOpen(!isEconomicMetricsOpen);
              }}
            >
              <div className="collapse-title-container">
                <img src={economicMetricsIcon} alt="economic-metrics-icon" />
                <div className="collapse-title-text">
                  <div className="collapse-title-text-1">
                    Wirtschaftliche Kennzahlen
                  </div>
                  <div className="collapse-title-text-2">
                    Wie stehen die Strukturdaten?
                  </div>
                </div>
              </div>
            </div>
            <div className="collapse-content">
              <div
                className="text-justify"
                style={{
                  padding:
                    "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
                }}
              >
                Hier finden Sie ab Dez 2022 Daten zu den Themen Arbeitskräfte,
                Arbeitslosenquote, Beschäftigte nach Anforderungsniveau, BIP pro
                Kopf, Gewerbesteuereinnahmen, Logistikcluster-Daten,
                Logistik-Attraktivität.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapTab;

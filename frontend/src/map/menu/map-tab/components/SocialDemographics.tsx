import { FunctionComponent, ReactNode, useContext, useState } from "react";

import { setBackgroundColor } from "../../../../shared/shared.functions";
import { ApiDataSource } from "../../../../../../shared/types/subscription-plan";
import MapMenuCollapsable from "./menu-collapsable/MapMenuCollapsable";
import CensusTable from "./data/CensusTable";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import FederalElectionTable from "./data/FederalElectionTable";
import { TCensusData } from "hooks/censusdata";
import socialDemographicsIcon from "../../../../assets/icons/map-menu/02-soziales-und-demographie.svg";
import censusDataIcon from "../../../../assets/icons/census-data.svg";
import federalElectionIcon from "../../../../assets/icons/federal-election.svg";
import { SearchContext } from "../../../../context/SearchContext";
import { UserContext } from "../../../../context/UserContext";

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

interface ISocialDemographicsProps {
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
}

const SocialDemographics: FunctionComponent<ISocialDemographicsProps> = ({
  openUpgradeSubscriptionModal,
  censusData,
  federalElectionData,
}) => {
  const {
    userState: { user, integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: { responseConfig: config },
  } = useContext(SearchContext);

  const [isSocialDemographicsOpen, setIsSocialDemographicsOpen] =
    useState(false);

  const isIntegrationUser = !!integrationUser;

  const hasCensusData =
    isIntegrationUser ||
    user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.CENSUS
    )!;

  const hasElectionData =
    isIntegrationUser ||
    user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.FEDERAL_ELECTION
    )!;

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

  return (
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
          <img src={socialDemographicsIcon} alt="social-demographics-icon" />
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
              <FederalElectionTable federalElectionData={federalElectionData} />
            </MapMenuCollapsable>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SocialDemographics;

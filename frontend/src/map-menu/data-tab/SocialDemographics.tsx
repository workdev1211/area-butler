import { FunctionComponent, ReactNode, useState } from "react";

import { IntlKeys } from "i18n/keys";
import { useTranslation } from "react-i18next";

import { setBackgroundColor } from "../../shared/shared.functions";
import { ApiDataSource } from "../../../../shared/types/subscription-plan";
import MapMenuCollapsable from "../map-tab/components/menu-collapsable/MapMenuCollapsable";
import CensusTable from "./data/CensusTable";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import FederalElectionTable from "./data/FederalElectionTable";
import socialDemographicsIcon from "../../assets/icons/map-menu/02-soziales-und-demographie.svg";
import censusDataIcon from "../../assets/icons/census-data.svg";
import federalElectionIcon from "../../assets/icons/federal-election.svg";
import { TUnlockIntProduct } from "../../../../shared/types/integration";
import { TCensusData } from "../../../../shared/types/data-provision";
import UnlockProductButton from "../components/UnlockProductButton";
import { useUserState } from "../../hooks/userstate";

const censusNotInSubscriptionPlanMessage = (
  <div>
    <p className="my-5">
      The Census Atlas is not available in your current subscription.
    </p>
    <p className="my-5">
      The Census Atlas contains economic and social data such as:
      <br />
      <ul className="list-disc ml-5 mt-5">
        <li key="population-density">Population density</li>
        <li key="average-age">Average age</li>
        <li key="living-space">Average living space per apartment</li>
        <li key="uvm">u.v.m.</li>
      </ul>
    </p>
    <p className="my-5">
      This gives you a detailed insight into the immediate surroundings of the object.
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
  isStatsDataAvailable: boolean;
  performUnlock: TUnlockIntProduct;
  backgroundColor: string;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
}

const SocialDemographics: FunctionComponent<ISocialDemographicsProps> = ({
  isStatsDataAvailable,
  performUnlock,
  backgroundColor,
  openUpgradeSubscriptionModal,
  censusData,
  federalElectionData,
}) => {
  const { t } = useTranslation();
  const { getCurrentUser } = useUserState();
  const user = getCurrentUser();
  const isIntegrationUser = "integrationUserId" in user;

  const [isSocialDemographicsOpen, setIsSocialDemographicsOpen] =
    useState(false);

  const hasCensusData =
    isIntegrationUser ||
    !!user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.CENSUS
    );

  const hasElectionData =
    isIntegrationUser ||
    !!user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.FEDERAL_ELECTION
    );

  return (
    <div
      q-id='social-demographics'
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
              {t(IntlKeys.snapshotEditor.socialDemographics.label)}
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        {isStatsDataAvailable ? (
          <ul>
            <div>
              <li className="locality-option-li" key="list-item-zensus">
                <MapMenuCollapsable
                  title={t(
                    IntlKeys.snapshotEditor.socialDemographics.censusData
                  )}
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
            </div>
            <div>
              <li className="locality-option-li" key="list-item-btw">
                <MapMenuCollapsable
                  title={t(
                    IntlKeys.snapshotEditor.socialDemographics.federalElections
                  )}
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
                    federalElectionData={federalElectionData}
                  />
                </MapMenuCollapsable>
              </li>
            </div>
          </ul>
        ) : (
          <UnlockProductButton performUnlock={performUnlock} />
        )}
      </div>
    </div>
  );
};

export default SocialDemographics;

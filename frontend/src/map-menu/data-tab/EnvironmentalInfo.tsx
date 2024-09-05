import { FC, ReactNode, useState } from "react";

import { IntlKeys } from "i18n/keys";
import { useTranslation } from "react-i18next";

import { ApiGeojsonFeature } from "../../../../shared/types/types";
import { setBackgroundColor } from "../../shared/shared.functions";
import { ApiDataSource } from "../../../../shared/types/subscription-plan";
import MapMenuCollapsable from "../map-tab/components/menu-collapsable/MapMenuCollapsable";
import ParticlePollutionTable from "./data/ParticlePollutionTable";
import environmentalInfoIcon from "../../assets/icons/map-menu/03-umweltinformationen.svg";
import particlePollutionIcon from "../../assets/icons/particle-pollution.svg";
import { TUnlockIntProduct } from "../../../../shared/types/integration";
import UnlockProductButton from "../components/UnlockProductButton";
import { useUserState } from "../../hooks/userstate";

interface IEnvironmentalInfoProps {
  isStatsDataAvailable: boolean;
  performUnlock: TUnlockIntProduct;
  backgroundColor: string;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  particlePollutionData?: ApiGeojsonFeature[];
}

const EnvironmentalInfo: FC<IEnvironmentalInfoProps> = ({
  isStatsDataAvailable,
  performUnlock,
  backgroundColor,
  openUpgradeSubscriptionModal,
  particlePollutionData,
}) => {
  const { t } = useTranslation();
  const { getActualUser } = useUserState();
  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;

  const [isEnvironmentalInfoOpen, setIsEnvironmentalInfoOpen] = useState(false);

  const hasPollutionData =
    isIntegrationUser ||
    user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.PARTICLE_POLLUTION
    )!;

  return (
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
          <img src={environmentalInfoIcon} alt="environmental-info-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">
              {t(IntlKeys.snapshotEditor.environmentInfo.label)}
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        {isStatsDataAvailable ? (
          <ul>
            <div>
              <li
                className="locality-option-li"
                key="list-item-zensus-feinstaub"
              >
                <MapMenuCollapsable
                  title={t(
                    IntlKeys.snapshotEditor.environmentInfo
                      .particulateMatterPollution
                  )}
                  icon={particlePollutionIcon}
                  subscriptionCheck={() => hasPollutionData}
                  openUpgradeSubscriptionModal={() => {
                    openUpgradeSubscriptionModal &&
                      openUpgradeSubscriptionModal(hasPollutionData);
                  }}
                >
                  <ParticlePollutionTable
                    particlePollutionData={particlePollutionData}
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

export default EnvironmentalInfo;

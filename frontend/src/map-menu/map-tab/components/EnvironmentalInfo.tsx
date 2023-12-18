import { FunctionComponent, ReactNode, useState } from "react";

import { ApiGeojsonFeature } from "../../../../../shared/types/types";
import { setBackgroundColor } from "../../../shared/shared.functions";
import { ApiDataSource } from "../../../../../shared/types/subscription-plan";
import MapMenuCollapsable from "./menu-collapsable/MapMenuCollapsable";
import ParticlePollutionTable from "./data/ParticlePollutionTable";
import environmentalInfoIcon from "../../../assets/icons/map-menu/03-umweltinformationen.svg";
import particlePollutionIcon from "../../../assets/icons/particle-pollution.svg";
import { TUnlockIntProduct } from "../../../../../shared/types/integration";
import { useTools } from "../../../hooks/tools";
import UnlockProductButton from "../../components/UnlockProductButton";

interface IEnvironmentalInfoProps {
  isStatsExportActive: boolean;
  performUnlock: TUnlockIntProduct;
  backgroundColor: string;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  particlePollutionData?: ApiGeojsonFeature[];
}

const EnvironmentalInfo: FunctionComponent<IEnvironmentalInfoProps> = ({
  isStatsExportActive,
  performUnlock,
  backgroundColor,
  openUpgradeSubscriptionModal,
  particlePollutionData,
}) => {
  const { getActualUser } = useTools();
  const user = getActualUser();
  const isIntegrationUser = "accessToken" in user;

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
            <div className="collapse-title-text-1">Umweltinformationen</div>
            <div className="collapse-title-text-2">Wie lebt es sich?</div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        {isStatsExportActive ? (
          <ul>
            <li className="locality-option-li" key="list-item-zensus-feinstaub">
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
                  particlePollutionData={particlePollutionData}
                />
              </MapMenuCollapsable>
            </li>
          </ul>
        ) : (
          <UnlockProductButton performUnlock={performUnlock} />
        )}
      </div>
    </div>
  );
};

export default EnvironmentalInfo;

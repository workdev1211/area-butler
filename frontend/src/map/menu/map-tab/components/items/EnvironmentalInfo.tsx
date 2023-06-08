import { FunctionComponent, ReactNode, useContext, useState } from "react";

import { ApiGeojsonFeature } from "../../../../../../../shared/types/types";
import { setBackgroundColor } from "../../../../../shared/shared.functions";
import { ApiDataSource } from "../../../../../../../shared/types/subscription-plan";
import MapMenuCollapsable from "../menu-collapsable/MapMenuCollapsable";
import ParticlePollutionTable from "../data/ParticlePollutionTable";
import environmentalInfoIcon from "../../../../../assets/icons/map-menu/03-umweltinformationen.svg";
import particlePollutionIcon from "../../../../../assets/icons/particle-pollution.svg";
import { SearchContext } from "../../../../../context/SearchContext";
import { UserContext } from "../../../../../context/UserContext";

interface IEnvironmentalInfoProps {
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  particlePollutionData?: ApiGeojsonFeature[];
}

const EnvironmentalInfo: FunctionComponent<IEnvironmentalInfoProps> = ({
  openUpgradeSubscriptionModal,
  particlePollutionData,
}) => {
  const {
    userState: { user, integrationUser },
  } = useContext(UserContext);
  const {
    searchContextState: { responseConfig: config },
  } = useContext(SearchContext);

  const [isEnvironmentalInfoOpen, setIsEnvironmentalInfoOpen] = useState(false);

  const hasPollutionData =
    !!integrationUser ||
    user?.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.PARTICLE_POLLUTION
    )!;

  const backgroundColor = config?.primaryColor || "var(--primary-gradient)";

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
      </div>
    </div>
  );
};

export default EnvironmentalInfo;

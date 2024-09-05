import { FC, useContext } from "react";

import "./DataTab.scss";

import { IDataTabProps } from "shared/search-result.types";
import { SearchContext } from "../../context/SearchContext";
import LocationExport from "./components/LocationExport";
// import CustomerLinks from "./components/CustomerLinks";
import CustomerData from "./components/CustomerData";
import LocationIndices from "./LocationIndices";
import SocialDemographics from "./SocialDemographics";
import EnvironmentalInfo from "./EnvironmentalInfo";
import EconomicMetrics from "./EconomicMetrics";
import { FeatureTypeEnum } from "../../../../shared/types/types";
import { useUserState } from "../../hooks/userstate";

const DataTab: FC<IDataTabProps> = ({
  snapshotId,
  performUnlock,
  locationIndexData,
  showInsights,
  censusData,
  federalElectionData,
  openUpgradeSubscriptionModal,
  particlePollutionData,
}) => {
  const { searchContextState } = useContext(SearchContext);

  const { checkIsFeatAvailable, getActualUser } = useUserState();
  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;

  const hasOpenAiFeature =
    isIntegrationUser || !!user?.subscription?.config.appFeatures.openAi;

  const isStatsDataAvailable = checkIsFeatAvailable(FeatureTypeEnum.STATS_DATA);

  const backgroundColor =
    searchContextState.responseConfig?.primaryColor ||
    "var(--primary-gradient)";

  return (
    <div className="data-tab z-9000">
      <LocationExport
        snapshotId={snapshotId}
        hasOpenAiFeature={hasOpenAiFeature}
        backgroundColor={backgroundColor}
        performUnlock={performUnlock}
      />

      {/* TODO waits for the customer */}
      {/*<CustomerLinks backgroundColor={backgroundColor} />*/}

      <LocationIndices
        isStatsDataAvailable={isStatsDataAvailable}
        performUnlock={performUnlock!}
        backgroundColor={backgroundColor}
        locationIndexData={locationIndexData}
      />

      {showInsights && (
        <SocialDemographics
          isStatsDataAvailable={isStatsDataAvailable}
          performUnlock={performUnlock!}
          backgroundColor={backgroundColor}
          openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
          censusData={censusData}
          federalElectionData={federalElectionData}
        />
      )}

      <EnvironmentalInfo
        isStatsDataAvailable={isStatsDataAvailable}
        performUnlock={performUnlock!}
        backgroundColor={backgroundColor}
        openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
        particlePollutionData={particlePollutionData}
      />

      <EconomicMetrics />

      <CustomerData backgroundColor={backgroundColor} snapshotId={snapshotId} />
    </div>
  );
};

export default DataTab;

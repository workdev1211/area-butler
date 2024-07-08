import { FunctionComponent, ReactNode, useContext } from "react";

import { ResultEntity } from "../../shared/search-result.types";
import {
  ApiGeojsonFeature,
  FeatureTypeEnum,
  IApiUserPoiIcon,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../shared/types/types";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../shared/types/routing";
import Localities from "./components/Localities";
import LocationIndices from "./components/LocationIndices";
import SocialDemographics from "./components/SocialDemographics";
import EnvironmentalInfo from "./components/EnvironmentalInfo";
import EconomicMetrics from "./components/EconomicMetrics";
import { SearchContext } from "../../context/SearchContext";
import { TUnlockIntProduct } from "../../../../shared/types/integration";
import { TCensusData } from "../../../../shared/types/data-provision";
import { TLocationIndexData } from "../../../../shared/types/location-index";
import { useTools } from "../../hooks/tools";

interface IMapTabProps {
  toggleAllLocalities: () => void;
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  mapDisplayMode: MapDisplayModesEnum;
  performUnlock: TUnlockIntProduct;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  showInsights?: boolean;
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  locationIndexData?: TLocationIndexData;
  userMenuPoiIcons?: IApiUserPoiIcon[];
}

const MapTab: FunctionComponent<IMapTabProps> = ({
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mapDisplayMode,
  openUpgradeSubscriptionModal,
  showInsights = true,
  censusData,
  federalElectionData,
  particlePollutionData,
  locationIndexData,
  userMenuPoiIcons,
  performUnlock,
}) => {
  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);

  const { checkIsFeatAvailable } = useTools();

  const isStatsDataAvailable = checkIsFeatAvailable(FeatureTypeEnum.STATS_DATA);
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;
  const backgroundColor =
    responseConfig?.primaryColor || "var(--primary-gradient)";

  return (
    <div className="map-tab z-9000">
      <Localities
        toggleAllLocalities={toggleAllLocalities}
        toggleRoute={toggleRoute}
        routes={routes}
        toggleTransitRoute={toggleTransitRoute}
        transitRoutes={transitRoutes}
        mapDisplayMode={mapDisplayMode}
        backgroundColor={backgroundColor}
        userMenuPoiIcons={userMenuPoiIcons}
      />

      {isEditorMode && (
        <LocationIndices
          isStatsDataAvailable={isStatsDataAvailable}
          performUnlock={performUnlock}
          backgroundColor={backgroundColor}
          locationIndexData={locationIndexData}
        />
      )}

      {showInsights && isEditorMode && (
        <SocialDemographics
          isStatsDataAvailable={isStatsDataAvailable}
          performUnlock={performUnlock}
          backgroundColor={backgroundColor}
          openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
          censusData={censusData}
          federalElectionData={federalElectionData}
        />
      )}

      {isEditorMode && (
        <>
          <EnvironmentalInfo
            isStatsDataAvailable={isStatsDataAvailable}
            performUnlock={performUnlock}
            backgroundColor={backgroundColor}
            openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
            particlePollutionData={particlePollutionData}
          />
          <EconomicMetrics />
        </>
      )}
    </div>
  );
};

export default MapTab;

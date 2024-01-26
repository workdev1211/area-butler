import { FunctionComponent, ReactNode, useContext } from "react";

import { EntityGroup, ResultEntity } from "../../shared/search-result.types";
import {
  ApiGeojsonFeature,
  MapDisplayModesEnum,
  MeansOfTransportation,
  IApiUserPoiIcon,
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
import { ConfigContext } from "../../context/ConfigContext";
import {
  IntegrationTypesEnum,
  TUnlockIntProduct,
} from "../../../../shared/types/integration";
import { TCensusData } from "../../../../shared/types/data-provision";
import { TLocationIndexData } from "../../../../shared/types/location-index";

interface IMapTabProps {
  groupedEntries: EntityGroup[];
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
  groupedEntries,
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
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing, responseConfig },
  } = useContext(SearchContext);

  // TODO PROPSTACK CONTINGENT
  const isStatsExportActive = !!(integrationType &&
  integrationType !== IntegrationTypesEnum.PROPSTACK
    ? realEstateListing?.isStatsFullExportActive
    : true);

  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;
  const backgroundColor =
    responseConfig?.primaryColor || "var(--primary-gradient)";

  return (
    <div className="map-tab z-9000">
      <Localities
        groupedEntries={groupedEntries}
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
          isStatsExportActive={isStatsExportActive}
          performUnlock={performUnlock}
          backgroundColor={backgroundColor}
          locationIndexData={locationIndexData}
        />
      )}

      {showInsights && isEditorMode && (
        <SocialDemographics
          isStatsExportActive={isStatsExportActive}
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
            isStatsExportActive={isStatsExportActive}
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

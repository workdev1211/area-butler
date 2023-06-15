import { FunctionComponent, ReactNode } from "react";

import {
  EntityGroup,
  ResultEntity,
} from "../../../components/SearchResultContainer";
import {
  ApiGeojsonFeature,
  MapDisplayModesEnum,
  MeansOfTransportation,
  IApiUserPoiIcon,
} from "../../../../../shared/types/types";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { TCensusData } from "hooks/censusdata";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import { TLocationIndexData } from "../../../hooks/locationindexdata";
import Localities from "./components/Localities";
import LocationIndices from "./components/LocationIndices";
import SocialDemographics from "./components/SocialDemographics";
import EnvironmentalInfo from "./components/EnvironmentalInfo";
import EconomicMetrics from "./components/EconomicMetrics";

interface IMapTabProps {
  groupedEntries: EntityGroup[];
  toggleAllLocalities: () => void;
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  mapDisplayMode: MapDisplayModesEnum;
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
}) => {
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

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
        userMenuPoiIcons={userMenuPoiIcons}
      />

      {isEditorMode && (
        <LocationIndices locationIndexData={locationIndexData} />
      )}

      {showInsights && isEditorMode && (
        <SocialDemographics
          openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
          censusData={censusData}
          federalElectionData={federalElectionData}
        />
      )}

      {isEditorMode && (
        <>
          <EnvironmentalInfo
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

import { FunctionComponent, ReactNode, useContext, useState } from "react";

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
import ConfirmationModal from "../../../components/ConfirmationModal";
import { statsExportUnlockText } from "../../../../../shared/constants/on-office/products";
import {
  OnOfficeIntActTypesEnum,
  TOnOfficeIntActTypes,
} from "../../../../../shared/types/on-office";
import { SearchContext } from "../../../context/SearchContext";
import { useIntegrationTools } from "../../../hooks/integrationtools";
import { ConfigContext } from "../../../context/ConfigContext";

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
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { unlockProduct } = useIntegrationTools();

  const [unlockParams, setUnlockParams] = useState<{
    isShownModal: boolean;
    actionType?: TOnOfficeIntActTypes;
  }>({ isShownModal: false });

  const isStatsExportActive = !!(integrationType
    ? realEstateListing?.isStatsFullExportActive
    : false);
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

  return (
    <div className="map-tab z-9000">
      {unlockParams.isShownModal && (
        <ConfirmationModal
          closeModal={() => {
            setUnlockParams({ isShownModal: false });
          }}
          onConfirm={async () => {
            await unlockProduct(unlockParams.actionType!);
          }}
          text={statsExportUnlockText}
        />
      )}

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
        <LocationIndices
          locationIndexData={locationIndexData}
          isStatsExportActive={isStatsExportActive}
          performUnlock={() => {
            setUnlockParams({
              isShownModal: true,
              actionType: OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT,
            });
          }}
        />
      )}

      {showInsights && isEditorMode && (
        <SocialDemographics
          openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
          censusData={censusData}
          federalElectionData={federalElectionData}
          isStatsExportActive={isStatsExportActive}
          performUnlock={() => {
            setUnlockParams({
              isShownModal: true,
              actionType: OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT,
            });
          }}
        />
      )}

      {isEditorMode && (
        <>
          <EnvironmentalInfo
            openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
            particlePollutionData={particlePollutionData}
            isStatsExportActive={isStatsExportActive}
            performUnlock={() => {
              setUnlockParams({
                isShownModal: true,
                actionType: OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT,
              });
            }}
          />
          <EconomicMetrics />
        </>
      )}
    </div>
  );
};

export default MapTab;

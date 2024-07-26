import { FunctionComponent, useContext } from "react";

import Localities from "./components/Localities";
import { SearchContext } from "../../context/SearchContext";
import { useTools } from "../../hooks/tools";
import MapScreenshots from './components/MapScreenshots';
import DigitalMedia from './components/DigitalMedia';
import OpenAiTexts from './components/OpenAiTexts';
import {
  IMapTabProps,
} from "shared/search-result.types";
import { MapDisplayModesEnum } from '../../../../shared/types/types';

import './MapTab.scss'

const MapTab: FunctionComponent<IMapTabProps> = ({
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mapDisplayMode,
  userMenuPoiIcons,
  performUnlock,
  searchAddress,
  snapshotId
}) => {
  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);

  const { getActualUser } = useTools();
  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;
  
  
  const hasOpenAiFeature =
    isIntegrationUser || !!user?.subscription?.config.appFeatures.openAi;
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
      
      {isEditorMode && searchAddress && <MapScreenshots
        searchAddress={searchAddress}
        backgroundColor={backgroundColor}
      />}
      
      {isEditorMode && searchAddress && <DigitalMedia
        searchAddress={searchAddress}
        backgroundColor={backgroundColor}
        performUnlock={performUnlock}
      />}
      
      {isEditorMode && hasOpenAiFeature && snapshotId && (
        <OpenAiTexts
          snapshotId={snapshotId}
          backgroundColor={backgroundColor}
          performUnlock={performUnlock}
        />
      )}
    </div>
  );
};

export default MapTab;

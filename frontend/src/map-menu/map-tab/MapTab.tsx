import { FC, useContext } from "react";

import "./MapTab.scss";

import Localities from "./components/Localities";
import { SearchContext } from "../../context/SearchContext";
import MapScreenshots from "./components/MapScreenshots";
import DigitalMedia from "./components/DigitalMedia";
import OpenAiTexts from "./components/OpenAiTexts";
import { IMapTabProps } from "shared/search-result.types";
import { MapDisplayModesEnum } from "../../../../shared/types/types";
import { useUserState } from "../../hooks/userstate";

const MapTab: FC<IMapTabProps> = ({
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mapDisplayMode,
  menuPoiIcons,
  performUnlock,
  searchAddress,
  snapshotId,
}) => {
  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);

  const { getEmbeddedUser } = useUserState();
  const user = getEmbeddedUser();
  const isIntegrationUser = !!(user && "integrationUserId" in user);

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
        menuPoiIcons={menuPoiIcons}
      />

      {isEditorMode && searchAddress && (
        <MapScreenshots
          searchAddress={searchAddress}
          backgroundColor={backgroundColor}
        />
      )}

      {isEditorMode && searchAddress && (
        <DigitalMedia
          searchAddress={searchAddress}
          backgroundColor={backgroundColor}
          performUnlock={performUnlock}
        />
      )}

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

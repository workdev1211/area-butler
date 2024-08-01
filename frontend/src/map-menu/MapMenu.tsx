import { FC, ReactNode, useContext, useState } from "react";

import "./MapMenu.scss";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  IDataTabProps,
  IEditorTabProps,
  ResultEntity,
} from "../shared/search-result.types";
import {
  ApiGeojsonFeature,
  ApiSearchResultSnapshotConfig,
  IApiUserPoiIcon,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../shared/types/types";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import editorIcon from "../assets/icons/editor.svg";
import mapIcon from "../assets/icons/map.svg";
import fileIcon from "../assets/icons/file.svg";
import MapTab from "./map-tab/MapTab";
import EditorTab from "./editor-tab/EditorTab";
import DataTab from "./data-tab/DataTab";
import MapMenuFooter from "./components/footer/MapMenuFooter";
import ConfirmationModal from "../components/ConfirmationModal";
import { statsExportUnlockText } from "../../../shared/constants/on-office/on-office-products";
import { useIntegrationTools } from "../hooks/integration/integrationtools";
import {
  IntegrationActionTypeEnum,
  TUnlockIntProduct,
} from "../../../shared/types/integration";
import { TCensusData } from "../../../shared/types/data-provision";
import { TLocationIndexData } from "../../../shared/types/location-index";
import { SearchContext } from "../context/SearchContext";

enum TabsEnum {
  Map = "Map",
  Data = "Data",
  Editor = "Editor",
}

export interface IMapMenuProps {
  isMapMenuOpen: boolean;
  mapDisplayMode: MapDisplayModesEnum;
  resetPosition: () => void;
  searchAddress: string;
  toggleAllLocalities: () => void;
  // Routes START
  routes: EntityRoute[];
  transitRoutes: EntityTransitRoute[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  toggleTransitRoute: (item: ResultEntity) => void;
  // Routes END
  config?: ApiSearchResultSnapshotConfig;
  editorTabProps?: IEditorTabProps;
  dataTabProps?: IDataTabProps;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  saveConfig?: () => Promise<void>;
  showInsights?: boolean;
  userMenuPoiIcons?: IApiUserPoiIcon[];
  // Stats START
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
  locationIndexData?: TLocationIndexData;
  particlePollutionData?: ApiGeojsonFeature[];
  // Stats END
}

const MapMenu: FC<IMapMenuProps> = ({
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  searchAddress,
  isMapMenuOpen,
  mapDisplayMode,
  config,
  saveConfig,
  userMenuPoiIcons,
  editorTabProps,
  dataTabProps,
}) => {
  const { t } = useTranslation();
  const { unlockProduct } = useIntegrationTools();

  const [activeTab, setActiveTab] = useState(TabsEnum.Map);
  const [unlockParams, setUnlockParams] = useState<{
    isShownModal: boolean;
    modalMessage?: string;
    actionType?: IntegrationActionTypeEnum;
  }>({ isShownModal: false });

  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);

  const isMapTab = activeTab === TabsEnum.Map;
  const isEditorTab = activeTab === TabsEnum.Editor;
  const isDataTab = activeTab === TabsEnum.Data;
  const isShownAddress = !!config?.showAddress || !config;
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

  const toggleShowAddress = () => {
    editorTabProps?.onConfigChange({
      ...responseConfig,
      showAddress: !responseConfig!.showAddress,
    });
  };

  const performUnlock: TUnlockIntProduct = (
    modalMessage = statsExportUnlockText,
    actionType = IntegrationActionTypeEnum.UNLOCK_STATS_EXPORT
  ): void => {
    setUnlockParams({
      modalMessage,
      actionType,
      isShownModal: true,
    });
  };

  return (
    <div
      className={`map-menu ${isMapMenuOpen ? "map-menu-open" : ""} ${
        isEditorMode ? "editor-mode" : ""
      }`}
      data-tour="side-menu"
    >
      {isEditorMode && unlockParams.isShownModal && (
        <ConfirmationModal
          closeModal={() => {
            setUnlockParams({ isShownModal: false });
          }}
          onConfirm={async () => {
            await unlockProduct(unlockParams.actionType!);
          }}
          text={unlockParams.modalMessage!}
        />
      )}

      {isEditorMode && (
        <div className="tab-bar">
          <div className="tab-container" data-tour="tab-icons">
            <div
              className={`tab-item${isMapTab ? " tab-item-active" : ""}`}
              onClick={() => {
                setActiveTab(TabsEnum.Map);
              }}
              data-tour="icon-karte"
            >
              <img src={mapIcon} alt="map-icon" />
              <div>{t(IntlKeys.snapshotEditor.map)}</div>
            </div>
            <div
              className={`tab-item${isDataTab ? " tab-item-active" : ""}`}
              onClick={() => {
                setActiveTab(TabsEnum.Data);
              }}
              data-tour="icon-exporte"
            >
              <img src={fileIcon} alt="data-icon" />
              <div>{t(IntlKeys.snapshotEditor.data)}</div>
            </div>
            <div
              className={`tab-item${isEditorTab ? " tab-item-active" : ""}`}
              onClick={() => {
                setActiveTab(TabsEnum.Editor);
              }}
              data-tour="icon-editor"
            >
              <img src={editorIcon} alt="editor-icon" />
              <div>{t(IntlKeys.snapshotEditor.editor)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="map-menu-header" data-tour="reset-position">
        <label className="cursor-pointer flex items-center">
          {isEditorMode && (
            <input
              type="checkbox"
              className="toggle"
              checked={responseConfig?.showAddress}
              onChange={toggleShowAddress}
            />
          )}
          <span className="label-text text-white map-menu-header-text">
            {isShownAddress
              ? searchAddress
              : t(IntlKeys.snapshotEditor.addressNotPublished)}
          </span>
        </label>
      </div>

      <div
        className={`map-menu-content ${!isEditorMode ? "embed-mode" : ""}`}
        data-tour="map-menu-contents"
      >
        {isMapTab && (
          <MapTab
            snapshotId={editorTabProps?.snapshotId}
            searchAddress={searchAddress}
            toggleAllLocalities={toggleAllLocalities}
            toggleRoute={toggleRoute}
            routes={routes}
            toggleTransitRoute={toggleTransitRoute}
            transitRoutes={transitRoutes}
            mapDisplayMode={mapDisplayMode}
            userMenuPoiIcons={userMenuPoiIcons}
            performUnlock={performUnlock}
          />
        )}
        {isDataTab && isEditorMode && dataTabProps && (
          <DataTab {...{ ...dataTabProps, performUnlock }} />
        )}

        {isEditorTab && isEditorMode && editorTabProps && (
          <EditorTab {...editorTabProps} />
        )}
      </div>

      {isEditorMode && <MapMenuFooter saveConfig={saveConfig} />}
    </div>
  );
};

export default MapMenu;

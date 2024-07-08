import { FC, ReactNode, useState } from "react";

import "./MapMenu.scss";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  IEditorTabProps,
  IExportTabProps,
  ResultEntity,
} from "../shared/search-result.types";
import positionIcon from "../assets/icons/icons-16-x-16-outline-ic-position.svg";
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
import downloadIcon from "../assets/icons/download.svg";
import MapTab from "./map-tab/MapTab";
import EditorTab from "./editor-tab/EditorTab";
import ExportTab from "./export-tab/ExportTab";
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

enum TabsEnum {
  Map = "Map",
  Editor = "Editor",
  Export = "Export",
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
  exportTabProps?: IExportTabProps;
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
  resetPosition,
  mapDisplayMode,
  config,
  saveConfig,
  openUpgradeSubscriptionModal,
  showInsights = true,
  censusData,
  federalElectionData,
  particlePollutionData,
  locationIndexData,
  userMenuPoiIcons,
  editorTabProps,
  exportTabProps,
}) => {
  const { t } = useTranslation();
  const { unlockProduct } = useIntegrationTools();

  const [activeTab, setActiveTab] = useState(TabsEnum.Map);
  const [unlockParams, setUnlockParams] = useState<{
    isShownModal: boolean;
    modalMessage?: string;
    actionType?: IntegrationActionTypeEnum;
  }>({ isShownModal: false });

  const isMapTab = activeTab === TabsEnum.Map;
  const isEditorTab = activeTab === TabsEnum.Editor;
  const isExportTab = activeTab === TabsEnum.Export;
  const isShownAddress = !!config?.showAddress || !config;
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

  let mapMenuContentHeight;

  switch (mapDisplayMode) {
    case MapDisplayModesEnum.EDITOR: {
      mapMenuContentHeight =
        "calc(100% - calc(var(--menu-item-h) * 3) - var(--menu-footer-h))";
      break;
    }

    case MapDisplayModesEnum.EMBEDDED:
    default: {
      mapMenuContentHeight = "calc(100% - var(--menu-item-h))";
    }
  }

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
      className={`map-menu ${isMapMenuOpen ? "map-menu-open" : ""}`}
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
        <div className="tab-bar bg-primary-gradient">
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
              className={`tab-item${isEditorTab ? " tab-item-active" : ""}`}
              onClick={() => {
                setActiveTab(TabsEnum.Editor);
              }}
              data-tour="icon-editor"
            >
              <img src={editorIcon} alt="editor-icon" />
              <div>{t(IntlKeys.snapshotEditor.editor)}</div>
            </div>
            <div
              className={`tab-item${isExportTab ? " tab-item-active" : ""}`}
              onClick={() => {
                setActiveTab(TabsEnum.Export);
              }}
              data-tour="icon-exporte"
            >
              <img src={downloadIcon} alt="export-icon" />
              <div>{t(IntlKeys.snapshotEditor.export)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="map-menu-header" data-tour="reset-position">
        <button
          type="button"
          className="btn btn-link flex gap-3"
          onClick={() => {
            if (isShownAddress) {
              resetPosition();
            }
          }}
        >
          <img
            className="w-[20px] h-[20px]"
            src={positionIcon}
            alt="position-icon"
          />
          <div className="map-menu-header-text">
            {isShownAddress
              ? searchAddress
              : t(IntlKeys.snapshotEditor.addressNotPublished)}
          </div>
        </button>
      </div>

      <div
        className="map-menu-content"
        style={{
          height: mapMenuContentHeight,
        }}
        data-tour="map-menu-contents"
      >
        {isMapTab && (
          <MapTab
            toggleAllLocalities={toggleAllLocalities}
            toggleRoute={toggleRoute}
            routes={routes}
            toggleTransitRoute={toggleTransitRoute}
            transitRoutes={transitRoutes}
            openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
            showInsights={showInsights}
            censusData={censusData}
            federalElectionData={federalElectionData}
            particlePollutionData={particlePollutionData}
            locationIndexData={locationIndexData}
            mapDisplayMode={mapDisplayMode}
            userMenuPoiIcons={userMenuPoiIcons}
            performUnlock={performUnlock}
          />
        )}

        {isEditorTab && isEditorMode && editorTabProps && (
          <EditorTab {...editorTabProps} />
        )}

        {isExportTab && isEditorMode && exportTabProps && (
          <ExportTab {...{ ...exportTabProps, performUnlock }} />
        )}
      </div>

      {isEditorMode && (
        <MapMenuFooter
          mapDisplayMode={mapDisplayMode}
          saveConfig={saveConfig}
        />
      )}
    </div>
  );
};

export default MapMenu;

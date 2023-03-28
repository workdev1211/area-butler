import { FunctionComponent, ReactNode, useState } from "react";

import "./MapMenu.scss";
import {
  EntityGroup,
  IEditorTabProps,
  IExportTabProps,
  ResultEntity,
} from "../../components/SearchResultContainer";
import positionIcon from "../../assets/icons/icons-16-x-16-outline-ic-position.svg";
import {
  ApiGeojsonFeature,
  ApiSearchResultSnapshotConfig,
  ApiUser,
  IApiUserPoiIcon,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../shared/types/types";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { TCensusData } from "hooks/censusdata";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../shared/types/routing";
import editorIcon from "../../assets/icons/editor.svg";
import mapIcon from "../../assets/icons/map.svg";
import downloadIcon from "../../assets/icons/download.svg";
import saveIcon from "../../assets/icons/save.svg";
import MapTab from "./map-tab/MapTab";
import EditorTab from "./editor-tab/EditorTab";
import ExportTab from "./export-tab/ExportTab";
import MapMenuFooter from "./footer/MapMenuFooter";
import BackButton from "../../layout/BackButton";
import { TLocationIndexData } from "../../hooks/locationindexdata";
import { MapClipping } from "../../context/SearchContext";
import FeedbackModal from "../../components/FeedbackModal";

enum TabsEnum {
  Map = "Map",
  Editor = "Editor",
  Export = "Export",
}

interface IMapMenuProps {
  groupedEntries: EntityGroup[];
  toggleAllLocalities: () => void;
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  searchAddress: string;
  isMapMenuOpen: boolean;
  resetPosition: () => void;
  mapClippings: MapClipping[];
  mapDisplayMode?: MapDisplayModesEnum;
  user?: ApiUser;
  config?: ApiSearchResultSnapshotConfig;
  saveConfig?: (config?: ApiSearchResultSnapshotConfig) => Promise<void>;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  showInsights?: boolean;
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  locationIndexData?: TLocationIndexData;
  editorTabProps?: IEditorTabProps;
  exportTabProps?: IExportTabProps;
  userMenuPoiIcons?: IApiUserPoiIcon[];
}

const MapMenu: FunctionComponent<IMapMenuProps> = ({
  groupedEntries,
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  searchAddress,
  isMapMenuOpen,
  resetPosition,
  mapDisplayMode,
  user,
  mapClippings,
  config,
  saveConfig,
  openUpgradeSubscriptionModal,
  showInsights = true,
  censusData,
  federalElectionData,
  particlePollutionData,
  locationIndexData,
  editorTabProps,
  exportTabProps,
  userMenuPoiIcons = user?.poiIcons?.menuPoiIcons,
}) => {
  const [activeTab, setActiveTab] = useState(TabsEnum.Map);
  const isShownAddress = !!config?.showAddress || !config;
  const editorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

  const mapMenuContentHeight = editorMode
    ? `calc(100% - calc(var(--menu-item-h) * ${
        isShownAddress ? 3 : 2
      }) - var(--menu-footer-h))`
    : "calc(100% - var(--menu-item-h))";

  return (
    <div
      className={`map-menu ${isMapMenuOpen ? "map-menu-open" : ""}`}
      data-tour="side-menu"
    >
      {editorMode && editorTabProps && (
        <div className="tab-bar bg-primary-gradient">
          <div className="tab-container" data-tour="tab-icons">
            <div
              className={`tab-item${
                activeTab === TabsEnum.Map ? " tab-item-active" : ""
              }`}
              onClick={() => {
                setActiveTab(TabsEnum.Map);
              }}
              data-tour="icon-karte"
            >
              <img src={mapIcon} alt="map-icon" />
              <div>Karte</div>
            </div>
            <div
              className={`tab-item${
                activeTab === TabsEnum.Editor ? " tab-item-active" : ""
              }`}
              onClick={() => {
                setActiveTab(TabsEnum.Editor);
              }}
              data-tour="icon-editor"
            >
              <img src={editorIcon} alt="editor-icon" />
              <div>Editor</div>
            </div>
            <div
              className={`tab-item${
                activeTab === TabsEnum.Export ? " tab-item-active" : ""
              }`}
              onClick={() => {
                setActiveTab(TabsEnum.Export);
              }}
              data-tour="icon-exporte"
            >
              <img src={downloadIcon} alt="export-icon" />
              <div>Exporte</div>
            </div>
          </div>
        </div>
      )}

      {((isShownAddress && editorMode) || !editorMode) && (
        <div className="map-menu-header">
          <button
            type="button"
            className="btn btn-link flex gap-3"
            onClick={() => {
              if (isShownAddress) {
                resetPosition();
              }
            }}
            data-tour="reset-position"
          >
            <img
              className="w-[20px] h-[20px]"
              src={positionIcon}
              alt="position-icon"
            />
            <div className="map-menu-header-text">
              {isShownAddress
                ? searchAddress
                : "Genaue Adresse nicht veröffentlicht"}
            </div>
          </button>
        </div>
      )}

      <div
        className="map-menu-content"
        style={{
          height: mapMenuContentHeight,
        }}
        data-tour="map-menu-contents"
      >
        {activeTab === TabsEnum.Map && (
          <MapTab
            groupedEntries={groupedEntries}
            toggleAllLocalities={toggleAllLocalities}
            toggleRoute={toggleRoute}
            routes={routes}
            toggleTransitRoute={toggleTransitRoute}
            transitRoutes={transitRoutes}
            user={user}
            userMenuPoiIcons={userMenuPoiIcons}
            mapClippings={mapClippings}
            searchAddress={searchAddress}
            config={config}
            saveConfig={saveConfig}
            openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
            showInsights={showInsights}
            censusData={censusData}
            federalElectionData={federalElectionData}
            particlePollutionData={particlePollutionData}
            locationIndexData={locationIndexData}
            mapDisplayMode={mapDisplayMode}
          />
        )}

        {activeTab === TabsEnum.Editor && editorMode && editorTabProps && (
          <EditorTab {...editorTabProps} />
        )}

        {activeTab === TabsEnum.Export && editorMode && exportTabProps && (
          <ExportTab {...exportTabProps} />
        )}
      </div>

      {editorMode && (
        <div className="map-menu-footer">
          <div className="button-container">
            <BackButton key="back-button" />
            <FeedbackModal />
            <button
              type="button"
              className="save-button"
              onClick={async () => {
                if (saveConfig) {
                  await saveConfig();
                }
              }}
              data-tour="save-button"
            >
              <img src={saveIcon} alt="save-icon" />
            </button>
          </div>
          <MapMenuFooter />
        </div>
      )}
    </div>
  );
};

export default MapMenu;

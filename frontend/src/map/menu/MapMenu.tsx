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
  MeansOfTransportation,
} from "../../../../shared/types/types";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { CensusData } from "hooks/censusdata";
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
import FormModal, { ModalConfig } from "../../components/FormModal";
import FeedbackFormHandler from "../../feedback/FeedbackFormHandler";

const feedbackModalConfig: ModalConfig = {
  buttonTitle: "?",
  buttonClass: "feedback-button",
  modalTitle: "Hilfe & Feedback",
};

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
  // TODO remove in future
  // isShownPreferredLocationsModal: boolean;
  // togglePreferredLocationsModal: (isShown: boolean) => void;
  editorMode: boolean;
  saveConfig?: () => Promise<void>;
  user?: ApiUser;
  config?: ApiSearchResultSnapshotConfig;
  openUpgradeSubscriptionModal?: (message: ReactNode) => void;
  showInsights?: boolean;
  censusData?: CensusData[];
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  editorTabProps?: IEditorTabProps;
  exportTabProps?: IExportTabProps;
  userPoiIcons?: IApiUserPoiIcon[];
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
  // TODO remove in future
  // isShownPreferredLocationsModal,
  // togglePreferredLocationsModal,
  editorMode,
  saveConfig,
  user,
  config,
  openUpgradeSubscriptionModal,
  showInsights = true,
  censusData,
  federalElectionData,
  particlePollutionData,
  editorTabProps,
  exportTabProps,
  userPoiIcons = user?.poiIcons,
}) => {
  const [activeTab, setActiveTab] = useState(TabsEnum.Map);

  // TODO remove in future
  // if (config?.theme) {
  //   switch (config?.theme) {
  //     case "KF":
  //       return (
  //         <MapMenuKarlaFricke
  //           groupedEntries={groupedEntries
  //             .filter(
  //               (ge) => ge.items.length && ge.title !== realEstateListingsTitle
  //             )
  //             .sort((a, b) => (a.title > b.title ? 1 : -1))}
  //           mobileMenuOpen={false}
  //           isShownPreferredLocationsModal={isShownPreferredLocationsModal}
  //           togglePreferredLocationsModal={togglePreferredLocationsModal}
  //         />
  //       );
  //
  //     default:
  //   }
  // }

  const isShownAddress = !!config?.showAddress || !config;

  const mapMenuContentHeight = editorMode
    ? `calc(100% - calc(var(--menu-item-h) * ${
        isShownAddress ? 3 : 2
      }) - var(--menu-footer-h))`
    : `calc(100% - calc(var(--menu-item-h) * ${isShownAddress ? 1 : 0})`;

  return (
    <div className={`map-menu ${isMapMenuOpen ? "map-menu-open" : ""}`}>
      {editorMode && editorTabProps && (
        <div className="tab-bar bg-primary-gradient">
          <div className="tab-container">
            <div
              className={`tab-item${
                activeTab === TabsEnum.Map ? " tab-item-active" : ""
              }`}
              onClick={() => {
                setActiveTab(TabsEnum.Map);
              }}
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
            <div
              className={`map-menu-header-text ${
                !isShownAddress ? "bg-primary-gradient" : ""
              }`}
            >
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
            userPoiIcons={userPoiIcons}
            config={config}
            openUpgradeSubscriptionModal={openUpgradeSubscriptionModal}
            showInsights={showInsights}
            censusData={censusData}
            federalElectionData={federalElectionData}
            particlePollutionData={particlePollutionData}
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
            <FormModal modalConfig={feedbackModalConfig}>
              <FeedbackFormHandler />
            </FormModal>
            <button type="button" className="save-button" onClick={saveConfig}>
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

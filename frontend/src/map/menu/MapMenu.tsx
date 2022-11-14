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
import { realEstateListingsTitle } from "../../shared/shared.functions";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { MapClipping } from "context/SearchContext";
import { CensusData } from "hooks/censusdata";
import MapMenuKarlaFricke from "./karla-fricke/MapMenuKarlaFricke";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../shared/types/routing";
import testIcon from "../../assets/icons/information.svg";
import MapTab from "./map-tab/MapTab";
import EditorTab from "./editor-tab/EditorTab";
import ExportTab from "./export-tab/ExportTab";
import MapMenuFooter from "./footer/MapMenuFooter";
import BackButton from "../../layout/BackButton";

enum TabsEnum {
  Map = "Map",
  Editor = "Editor",
  Export = "Export",
}

interface IMapMenuProps {
  groupedEntries: EntityGroup[];
  toggleAllLocalities: () => void;
  clippings: MapClipping[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  searchAddress: string;
  isMapMenuOpen: boolean;
  resetPosition: () => void;
  isShownPreferredLocationsModal: boolean;
  togglePreferredLocationsModal: (isShown: boolean) => void;
  editorMode: boolean;
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
  clippings = [],
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  searchAddress,
  isMapMenuOpen,
  resetPosition,
  isShownPreferredLocationsModal,
  togglePreferredLocationsModal,
  editorMode,
  user,
  config,
  openUpgradeSubscriptionModal,
  showInsights = true,
  censusData,
  federalElectionData,
  particlePollutionData,
  editorTabProps,
  exportTabProps,
  userPoiIcons,
}) => {
  const [activeTab, setActiveTab] = useState(TabsEnum.Map);

  if (config?.theme) {
    switch (config?.theme) {
      case "KF":
        return (
          <MapMenuKarlaFricke
            groupedEntries={groupedEntries
              .filter(
                (ge) => ge.items.length && ge.title !== realEstateListingsTitle
              )
              .sort((a, b) => (a.title > b.title ? 1 : -1))}
            mobileMenuOpen={false}
            isShownPreferredLocationsModal={isShownPreferredLocationsModal}
            togglePreferredLocationsModal={togglePreferredLocationsModal}
            userPoiIcons={userPoiIcons}
          />
        );

      default:
    }
  }

  const isAddressShown = !!config?.showAddress || !config;

  const mapMenuContentHeight = editorMode
    ? `calc(100% - calc(var(--menu-item-h) * ${
        isAddressShown ? 3 : 2
      }) - var(--menu-footer-h))`
    : `calc(100% - calc(var(--menu-item-h) * ${isAddressShown ? 1 : 0})`;

  return (
    <div className={`map-menu ${isMapMenuOpen ? "map-menu-open" : ""}`}>
      {editorMode && editorTabProps && (
        <div className="tab-bar">
          <div className="tab-container">
            <div
              className={`tab-item${
                activeTab === TabsEnum.Map ? " tab-item-active" : ""
              }`}
              onClick={() => {
                setActiveTab(TabsEnum.Map);
              }}
            >
              <img src={testIcon} alt="test" />
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
              <img src={testIcon} alt="test" />
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
              <img src={testIcon} alt="test" />
              <div>Exporte</div>
            </div>
          </div>
        </div>
      )}

      {isAddressShown && (
        <div className="map-menu-header">
          <button
            type="button"
            className="btn btn-link"
            onClick={resetPosition}
            data-tour="reset-position"
          >
            <img className="mr-1" src={positionIcon} alt="icon-position" />
            {searchAddress}
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
            clippings={clippings}
            toggleRoute={toggleRoute}
            routes={routes}
            toggleTransitRoute={toggleTransitRoute}
            transitRoutes={transitRoutes}
            searchAddress={searchAddress}
            user={user}
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
          <BackButton key="back-button" />
          <MapMenuFooter />
        </div>
      )}
    </div>
  );
};

export default MapMenu;

import { FC, useContext } from "react";

import "../../map-menu/MapMenu.scss";

import positionIcon from "../../assets/icons/icons-16-x-16-outline-ic-position.svg";
import { MapDisplayModesEnum } from "../../../../shared/types/types";
import Localities from "../../map-menu/map-tab/components/Localities";
import { SearchContext } from "../../context/SearchContext";
import { IMapMenuProps } from "../../map-menu/MapMenu";

export type TMyVivendaMapMenuProps = Pick<
  IMapMenuProps,
  | "groupedEntries"
  | "isMapMenuOpen"
  | "resetPosition"
  | "searchAddress"
  | "routes"
  | "transitRoutes"
  | "toggleRoute"
  | "toggleTransitRoute"
  | "toggleAllLocalities"
  | "config"
  | "userMenuPoiIcons"
>;

const MyVivendaMapMenu: FC<TMyVivendaMapMenuProps> = ({
  config,
  groupedEntries,
  isMapMenuOpen,
  resetPosition,
  searchAddress,
  routes,
  transitRoutes,
  toggleRoute,
  toggleTransitRoute,
  toggleAllLocalities,
  userMenuPoiIcons,
}) => {
  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);

  const isShownAddress = !!config?.showAddress || !config;
  const backgroundColor =
    responseConfig?.primaryColor || "var(--primary-gradient)";

  return (
    <div
      className={`map-menu ${isMapMenuOpen ? "map-menu-open" : ""}`}
      data-tour="side-menu"
    >
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
              : "Genaue Adresse nicht veröffentlicht"}
          </div>
        </button>
      </div>

      <div
        className="map-menu-content"
        style={{
          height: "calc(100% - var(--menu-item-h))",
        }}
        data-tour="map-menu-contents"
      >
        <Localities
          backgroundColor={backgroundColor}
          groupedEntries={groupedEntries}
          mapDisplayMode={MapDisplayModesEnum.EMBEDDED}
          routes={routes}
          transitRoutes={transitRoutes}
          toggleRoute={toggleRoute}
          toggleTransitRoute={toggleTransitRoute}
          toggleAllLocalities={toggleAllLocalities}
          userMenuPoiIcons={userMenuPoiIcons}
        />
      </div>
    </div>
  );
};

export default MyVivendaMapMenu;

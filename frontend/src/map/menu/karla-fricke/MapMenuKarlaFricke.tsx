import { FunctionComponent, memo, useContext, useState } from "react";

import { EntityGroup } from "../../../components/SearchResultContainer";
import "./MapMenuKarlaFricke.scss";
import {
  deriveIconForOsmName,
  getPreferredLocationsIcon,
  preferredLocationsTitle,
  getRealEstateListingsIcon,
  realEstateListingsTitle,
} from "../../../shared/shared.functions";
import { IApiUserPoiIcon } from "../../../../../shared/types/types";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../context/SearchContext";

interface IMapMenuKarlaFrickeProps {
  isMapMenuOpen: boolean;
  groupedEntries: EntityGroup[];
  isShownPreferredLocationsModal: boolean;
  togglePreferredLocationsModal: (isShown: boolean) => void;
  userPoiIcons?: IApiUserPoiIcon[];
}

const MapMenuKarlaFricke: FunctionComponent<IMapMenuKarlaFrickeProps> = ({
  isMapMenuOpen,
  groupedEntries,
  isShownPreferredLocationsModal,
  togglePreferredLocationsModal,
  userPoiIcons,
}) => {
  interface IListItemProps {
    group: EntityGroup;
    dropdown?: boolean;
  }

  const ListItem: FunctionComponent<IListItemProps> = ({
    group,
    dropdown = false,
  }) => {
    const { searchContextDispatch } = useContext(SearchContext);

    const isRealEstateListing =
      group.items[0].label === realEstateListingsTitle;

    const isPreferredLocation =
      group.items[0].label === preferredLocationsTitle;

    const groupIconInfo = isRealEstateListing
      ? getRealEstateListingsIcon(userPoiIcons)
      : isPreferredLocation
      ? getPreferredLocationsIcon(userPoiIcons)
      : deriveIconForOsmName(group.items[0].osmName, userPoiIcons);

    return (
      <li
        onClick={() => {
          togglePreferredLocationsModal(
            isPreferredLocation ? !isShownPreferredLocationsModal : false
          );

          searchContextDispatch({
            type: SearchContextActionTypes.TOGGLE_SINGLE_RESPONSE_GROUP,
            payload: group.title,
          });
        }}
        className={group.active ? "active" : ""}
      >
        <img src={groupIconInfo.icon} alt="group-icon" />
        {group.title}
        {dropdown && <span className="dropdown-triangle">&#9660;</span>}
      </li>
    );
  };

  const listItemPropsAreEqual = (
    prevItem: IListItemProps,
    nextItem: IListItemProps
  ) => {
    return prevItem.group.active === nextItem.group.active;
  };

  const ListItemMemo = memo(ListItem, listItemPropsAreEqual);

  const resultingList = groupedEntries.map((group) => (
    <ListItemMemo key={group.title} group={group} />
  ));

  interface IMenuProps {
    groupedEntries: EntityGroup[];
  }

  const DesktopMenu: FunctionComponent<IMenuProps> = ({ groupedEntries }) => {
    return <ul className="menu-desktop">{resultingList}</ul>;
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const MobileMenu: FunctionComponent<IMenuProps> = ({ groupedEntries }) => {
    const activeEntry = groupedEntries.find((ge) => ge.active);

    return (
      <div className={`menu-mobile ${dropdownOpen && "open"}`}>
        {groupedEntries.length && (
          <div
            className={`dropdown dropdown-end ${
              dropdownOpen && "dropdown-open"
            }`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div tabIndex={0} className="w-52">
              {activeEntry && (
                <ul>
                  <ListItemMemo group={activeEntry} dropdown={true} />
                </ul>
              )}
              {!activeEntry && "Bitte auswählen"}
            </div>
            <ul
              tabIndex={0}
              className="p-2 pr-0.5 menu dropdown-content bg-transparent"
            >
              {resultingList}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const menuClasses = `map-menu-KF ${isMapMenuOpen ? "map-menu-open" : ""}`;

  return (
    <div className={menuClasses}>
      <MobileMenu groupedEntries={groupedEntries} />
      <DesktopMenu groupedEntries={groupedEntries} />
    </div>
  );
};

export default MapMenuKarlaFricke;

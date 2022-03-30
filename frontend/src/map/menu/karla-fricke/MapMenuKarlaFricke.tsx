import React, { useState } from "react";
import { EntityGroup } from "../../../components/SearchResultContainer";
import "./MapMenuKarlaFricke.scss";
import {
  deriveIconForOsmName,
  preferredLocationsIcon,
  preferredLocationsTitle,
  realEstateListingsIcon,
  realEstateListingsTitle
} from "../../../shared/shared.functions";
import { OsmName } from "../../../../../shared/types/types";

export interface MapMenuKarlaFrickeProps {
  groupedEntries: EntityGroup[];
  activateGroup: (title: string) => void;
  mobileMenuOpen: boolean;
}

const MapMenuKarlaFricke: React.FunctionComponent<MapMenuKarlaFrickeProps> = ({
  mobileMenuOpen,
  groupedEntries,
  activateGroup
}) => {
  const menuClasses = `map-menu-KF ${mobileMenuOpen ? "mobile-open" : ""}`;

  interface ListItemProps {
    group: EntityGroup;
    activateGroup: (title: string) => void;
    dropdown?: boolean;
  }

  const ListItem: React.FunctionComponent<ListItemProps> = ({
    group,
    activateGroup,
    dropdown = false
  }) => {
    const isRealEstateListing =
      group.items[0].label === realEstateListingsTitle;
    const isPreferredLocation =
      group.items[0].label === preferredLocationsTitle;
    const groupIconInfo = isRealEstateListing
      ? realEstateListingsIcon
      : isPreferredLocation
      ? preferredLocationsIcon
      : deriveIconForOsmName(group.items[0].type as OsmName);
    return (
      <li
        onClick={() => activateGroup(group.title)}
        className={group.active ? "active" : ""}
      >
        <img src={groupIconInfo.icon} alt="group-icon" />
        {group.title}
        {dropdown && <span className="dropdown-triangle">&#9660;</span>}
      </li>
    );
  };
  const listItemPropsAreEqual = (
    prevItem: ListItemProps,
    nextItem: ListItemProps
  ) => {
    return prevItem.group.active === nextItem.group.active;
  };
  const ListItemMemo = React.memo(ListItem, listItemPropsAreEqual);

  interface MenuProps {
    groupedEntries: EntityGroup[];
    activateGroup: (title: string) => void;
  }

  const DesktopMenu: React.FunctionComponent<MenuProps> = ({
    groupedEntries,
    activateGroup
  }) => {
    return (
      <ul className="menu-desktop">
        {groupedEntries.map(ge => (
          <ListItemMemo
            group={ge}
            key={ge.title}
            activateGroup={title => activateGroup(title)}
          />
        ))}
      </ul>
    );
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const MobileMenu: React.FunctionComponent<MenuProps> = ({
    groupedEntries,
    activateGroup
  }) => {
    const activeEntry = groupedEntries.find(ge => ge.active);
    return (
      <div className={`menu-mobile ${dropdownOpen && "open"}`}>
        {groupedEntries.length && (
          <div
            className={`dropdown dropdown-end ${dropdownOpen &&
              "dropdown-open"}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div tabIndex={0} className="w-52">
              {activeEntry && (
                <ul>
                  <ListItemMemo
                    group={activeEntry}
                    activateGroup={() => null}
                    dropdown={true}
                  />
                </ul>
              )}
              {!activeEntry && "Bitte auswählen"}
            </div>
            <ul
              tabIndex={0}
              className="p-2 pr-0.5 menu dropdown-content bg-transparent"
            >
              {groupedEntries.map(ge => (
                <ListItemMemo
                  key={ge.title}
                  group={ge}
                  activateGroup={title => activateGroup(title)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={menuClasses}>
      <MobileMenu
        groupedEntries={groupedEntries}
        activateGroup={title => activateGroup(title)}
      />
      <DesktopMenu
        groupedEntries={groupedEntries}
        activateGroup={title => activateGroup(title)}
      />
    </div>
  );
};

export default MapMenuKarlaFricke;

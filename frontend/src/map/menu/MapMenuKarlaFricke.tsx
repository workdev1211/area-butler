import React, { useEffect } from "react";
import { EntityGroup } from "../../components/SearchResultContainer";
import "./MapMenuKarlaFricke.scss";
import {
  deriveIconForOsmName,
  preferredLocationsIcon,
  preferredLocationsTitle,
  realEstateListingsIcon,
  realEstateListingsTitle
} from "../../shared/shared.functions";
import { OsmName } from "../../../../shared/types/types";

export interface MapMenuKarlaFrickeProps {
  groupedEntries: EntityGroup[];
  toggleEntryGroup: (title: string) => void;
  mobileMenuOpen: boolean;
}

const MapMenuKarlaFricke: React.FunctionComponent<MapMenuKarlaFrickeProps> = ({
  mobileMenuOpen,
  groupedEntries,
  toggleEntryGroup
}) => {
  useEffect(() => {
    if (groupedEntries.length) {
      toggleEntryGroup(groupedEntries[0].title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedEntries.length]);

  const mobileMenuButtonClasses = `map-menu-kf ${
    mobileMenuOpen ? "mobile-open" : ""
  }`;

  interface ListItemProps {
    group: EntityGroup;
    toggleEntryGroup: (title: string) => void;
  }

  const ListItem: React.FunctionComponent<ListItemProps> = ({
    group,
    toggleEntryGroup
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
        onClick={() => toggleEntryGroup(group.title)}
        className={group.active ? "active" : ""}
      >
        <img src={groupIconInfo.icon} alt="group-icon" />
        {group.title}
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

  interface DesktopMenuProps {
    groupedEntries: EntityGroup[];
    toggleEntryGroup: (title: string) => void;
  }

  const DesktopMenu: React.FunctionComponent<DesktopMenuProps> = ({
    groupedEntries,
    toggleEntryGroup
  }) => {
    return (
      <ul className="menu-desktop">
        {groupedEntries.map(ge => (
          <ListItemMemo
            group={ge}
            key={ge.title}
            toggleEntryGroup={title => toggleEntryGroup(title)}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className={mobileMenuButtonClasses}>
      <DesktopMenu
        groupedEntries={groupedEntries}
        toggleEntryGroup={title => toggleEntryGroup(title)}
      />
    </div>
  );
};

export default MapMenuKarlaFricke;

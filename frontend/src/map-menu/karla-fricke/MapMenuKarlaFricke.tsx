import { FunctionComponent, memo, useContext, useState } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { EntityGroup } from "../../shared/search-result.types";
import "./MapMenuKarlaFricke.scss";
import {
  deriveIconForOsmName,
  getPreferredLocationsIcon,
  preferredLocationsTitle,
  getRealEstateListingsIcon,
} from "../../shared/shared.functions";
import { IApiUserPoiIcon } from "../../../../shared/types/types";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import { realEstateListingsTitle } from "../../../../shared/constants/real-estate";

interface IMapMenuKarlaFrickeProps {
  isMapMenuOpen: boolean;
  groupedEntries: EntityGroup[];
  isShownPreferredLocationsModal: boolean;
  togglePreferredLocationsModal: (isShown: boolean) => void;
  userMenuPoiIcons?: IApiUserPoiIcon[];
  userPrimaryColor?: string;
}

interface IMenuProps {
  groupedEntries: EntityGroup[];
}
interface IListItemProps {
  group: EntityGroup;
  isDropdownButton?: boolean;
}

const MapMenuKarlaFricke: FunctionComponent<IMapMenuKarlaFrickeProps> = ({
  isMapMenuOpen,
  groupedEntries,
  isShownPreferredLocationsModal,
  togglePreferredLocationsModal,
  userMenuPoiIcons,
}) => {
  const ListItem: FunctionComponent<IListItemProps> = ({
    group,
    isDropdownButton = false,
  }) => {
    const { t } = useTranslation();
    const { searchContextDispatch } = useContext(SearchContext);

    const isRealEstateListing =
      group.items[0].label === realEstateListingsTitle;

    const isPreferredLocation =
      group.items[0].label === preferredLocationsTitle;

    const groupIconInfo = isRealEstateListing
      ? getRealEstateListingsIcon(userMenuPoiIcons)
      : isPreferredLocation
      ? getPreferredLocationsIcon(userMenuPoiIcons)
      : deriveIconForOsmName(group.items[0].osmName, userMenuPoiIcons);

    return (
      <li
        className={group.active ? "active" : ""}
        onClick={() => {
          if (!isDropdownButton) {
            togglePreferredLocationsModal(
              isPreferredLocation ? !isShownPreferredLocationsModal : false
            );
          }

          searchContextDispatch({
            type: SearchContextActionTypes.TOGGLE_SINGLE_RESPONSE_GROUP,
            payload: group.title,
          });
        }}
      >
        <div className="img-container">
          <img src={groupIconInfo.icon} alt="group-icon" />
        </div>
        {t((IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>)[group.title])}
        {isDropdownButton && <span className="dropdown-triangle">&#9660;</span>}
      </li>
    );
  };

  const listItemPropsAreEqual = (
    prevItem: IListItemProps,
    nextItem: IListItemProps
  ) => prevItem.group.active === nextItem.group.active;

  const ListItemMemo = memo(ListItem, listItemPropsAreEqual);

  const resultingList = groupedEntries.map((group) => (
    <ListItemMemo key={group.title} group={group} />
  ));

  const DesktopMenu: FunctionComponent = () => {
    return <ul className="menu-desktop">{resultingList}</ul>;
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const MobileMenu: FunctionComponent<IMenuProps> = ({ groupedEntries }) => {
    const { t } = useTranslation();
    const activeEntry = groupedEntries.find((ge) => ge.active);

    return (
      <div className={`menu-mobile ${isDropdownOpen && "open"}`}>
        {groupedEntries.length && (
          <div
            className={`dropdown dropdown-end ${
              isDropdownOpen && "dropdown-open"
            }`}
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <div tabIndex={0} className="w-52">
              {activeEntry && (
                <ul>
                  <ListItemMemo group={activeEntry} isDropdownButton={true} />
                </ul>
              )}
              {!activeEntry && t(IntlKeys.snapshotEditor.pleaseSelect)}
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
      <DesktopMenu />
    </div>
  );
};

export default MapMenuKarlaFricke;

import { FC, memo, useContext, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { EntityGroup } from "../../shared/search-result.types";
import "./MapMenuKarlaFricke.scss";
import {
  deriveIconForPoiGroup,
  getPreferredLocationsIcon,
  getRealEstateListingsIcon,
} from "../../shared/shared.functions";
import { IApiPoiIcon, OsmName } from "../../../../shared/types/types";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";

interface IMapMenuKarlaFrickeProps {
  isMapMenuOpen: boolean;
  isShownPreferredLocationsModal: boolean;
  togglePreferredLocationsModal: (isShown: boolean) => void;
  menuPoiIcons?: IApiPoiIcon[];
  userPrimaryColor?: string;
}

interface IMenuProps {
  groupedEntries: EntityGroup[];
}
interface IListItemProps {
  group: EntityGroup;
  isDropdownButton?: boolean;
}

const MapMenuKarlaFricke: FC<IMapMenuKarlaFrickeProps> = ({
  isMapMenuOpen,
  isShownPreferredLocationsModal,
  togglePreferredLocationsModal,
  menuPoiIcons,
}) => {
  const {
    searchContextState: { entityGroupsByActMeans },
  } = useContext(SearchContext);

  const groupedEntries = useMemo(
    () =>
      entityGroupsByActMeans.filter(
        (ge) => ge.items.length && ge.name !== OsmName.property
      ),
    [entityGroupsByActMeans]
  );

  const ListItem: FC<IListItemProps> = ({
    group,
    isDropdownButton = false,
  }) => {
    const { searchContextDispatch } = useContext(SearchContext);

    const isRealEstateListing = group.name === OsmName.property;
    const isPreferredLocation = group.name === OsmName.favorite;

    const groupIconInfo = isRealEstateListing
      ? getRealEstateListingsIcon(menuPoiIcons)
      : isPreferredLocation
      ? getPreferredLocationsIcon(menuPoiIcons)
      : deriveIconForPoiGroup(group.name, menuPoiIcons);

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
            payload: group.name,
          });
        }}
      >
        <div className="img-container">
          <img src={groupIconInfo.icon} alt="group-icon" />
        </div>
        {group.title}
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
    <ListItemMemo key={group.name} group={group} />
  ));

  const DesktopMenu: FC = () => {
    return <ul className="menu-desktop">{resultingList}</ul>;
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const MobileMenu: FC<IMenuProps> = ({ groupedEntries }) => {
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

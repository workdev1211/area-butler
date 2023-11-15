import { FunctionComponent, useContext, useState } from "react";

import {
  EntityGroup,
  ResultEntity,
} from "../../../../shared/search-result.types";
import {
  ApiOsmEntityCategory,
  IApiUserPoiIcon,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../../../shared/types/types";
import {
  deriveIconForOsmName,
  getPreferredLocationsIcon,
  getRealEstateListingsIcon,
  preferredLocationsTitle,
  realEstateListingsTitle,
  setBackgroundColor,
} from "../../../../shared/shared.functions";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../../shared/types/routing";
import MapMenuListItem from "../../components/menu-item/MapMenuListItem";
import { IPoiIcon } from "../../../../shared/shared.types";
import localitiesIcon from "../../../../assets/icons/map-menu/01-lokalitäten.svg";
import { getCombinedOsmEntityTypes } from "../../../../../../shared/functions/shared.functions";
import { SearchContext } from "../../../../context/SearchContext";
import { UserContext } from "../../../../context/UserContext";

interface ILocalitiesProps {
  groupedEntries: EntityGroup[];
  toggleAllLocalities: () => void;
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  mapDisplayMode: MapDisplayModesEnum;
  backgroundColor: string;
  userMenuPoiIcons?: IApiUserPoiIcon[];
}

const Localities: FunctionComponent<ILocalitiesProps> = ({
  groupedEntries,
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mapDisplayMode,
  backgroundColor,
  userMenuPoiIcons,
}) => {
  const {
    userState: { user },
  } = useContext(UserContext);
  const {
    searchContextState: { responseConfig: config },
  } = useContext(SearchContext);

  const resultingPoiIcons = userMenuPoiIcons || user?.poiIcons?.menuPoiIcons;
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

  const [isLocalitiesOpen, setIsLocalitiesOpen] = useState(!isEditorMode);

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isLocalitiesOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title justify-between collapse-primary-white"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsLocalitiesOpen(!isLocalitiesOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={localitiesIcon} alt="localities-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">Points-of-Interest</div>
            <div className="collapse-title-text-2">Was ist in der Nähe?</div>
          </div>
        </div>
        <label className="cursor-pointer label justify-start pl-0">
          <input
            type="checkbox"
            checked={groupedEntries.some((e) => e.active)}
            className="checkbox checkbox-white checkbox-sm z-2500"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={toggleAllLocalities}
          />
        </label>
      </div>
      <div className="collapse-content">
        <ul>
          {/* Estates and important objects */}
          {groupedEntries
            .filter(
              (ge) =>
                ge.items.length &&
                [preferredLocationsTitle, realEstateListingsTitle].includes(
                  ge.title
                )
            )
            .map((ge, geIndex) => {
              const isRealEstateListing =
                ge.items[0].label === realEstateListingsTitle;

              const isPreferredLocation =
                ge.items[0].label === preferredLocationsTitle;

              const groupIconInfo: IPoiIcon = isRealEstateListing
                ? !!config?.mapIcon
                  ? { icon: config.mapIcon, color: "transparent" }
                  : getRealEstateListingsIcon(resultingPoiIcons)
                : isPreferredLocation
                ? getPreferredLocationsIcon(resultingPoiIcons)
                : deriveIconForOsmName(ge.items[0].osmName, resultingPoiIcons);

              return (
                <MapMenuListItem
                  entityGroup={ge}
                  groupIcon={groupIconInfo}
                  isCustomIcon={
                    (isRealEstateListing && !!config?.mapIcon) ||
                    groupIconInfo.isCustom
                  }
                  entityGroupIndex={geIndex}
                  routes={routes}
                  toggleRoute={toggleRoute}
                  transitRoutes={transitRoutes}
                  toggleTransitRoute={toggleTransitRoute}
                  config={config}
                  key={`${ge.title}-${geIndex}-map-menu-list-item-top`}
                />
              );
            })}

          {/* POIs */}
          {Object.entries(ApiOsmEntityCategory).map(([_, category]) => {
            return (
              <div key={`container-${category}`}>
                {groupedEntries.some(
                  (ge) =>
                    ge.items.length &&
                    getCombinedOsmEntityTypes().some(
                      (oet) =>
                        oet.label === ge.title && oet.category === category
                    )
                ) && (
                  <li className="locality-option-heading" key={category}>
                    <h4>{category}</h4>
                  </li>
                )}
                {groupedEntries
                  .filter(
                    (ge) =>
                      ge.items.length &&
                      getCombinedOsmEntityTypes().some(
                        (oet) =>
                          oet.label === ge.title && oet.category === category
                      )
                  )
                  .map((ge, geIndex) => {
                    const isRealEstateListing =
                      ge.items[0].label === realEstateListingsTitle;

                    const isPreferredLocation =
                      ge.items[0].label === preferredLocationsTitle;

                    const groupIconInfo: IPoiIcon = isRealEstateListing
                      ? getRealEstateListingsIcon(resultingPoiIcons)
                      : isPreferredLocation
                      ? getPreferredLocationsIcon(resultingPoiIcons)
                      : deriveIconForOsmName(
                          ge.items[0].osmName,
                          resultingPoiIcons
                        );

                    return (
                      <MapMenuListItem
                        entityGroup={ge}
                        groupIcon={groupIconInfo}
                        isCustomIcon={groupIconInfo.isCustom}
                        entityGroupIndex={geIndex}
                        config={config}
                        routes={routes}
                        toggleRoute={toggleRoute}
                        transitRoutes={transitRoutes}
                        toggleTransitRoute={toggleTransitRoute}
                        key={`${ge.title}-${geIndex}-map-menu-list-item`}
                      />
                    );
                  })}
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Localities;

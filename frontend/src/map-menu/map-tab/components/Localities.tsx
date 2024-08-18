import { FC, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { ResultEntity } from "../../../shared/search-result.types";
import {
  IApiUserPoiIcon,
  MapDisplayModesEnum,
  MeansOfTransportation,
  OsmName,
} from "../../../../../shared/types/types";
import {
  deriveIconForPoiGroup,
  getPreferredLocationsIcon,
  getRealEstateListingsIcon,
  setBackgroundColor,
} from "../../../shared/shared.functions";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import MapMenuListItem from "../../components/menu-item/MapMenuListItem";
import { IPoiIcon } from "../../../shared/shared.types";
import localitiesIcon from "../../../assets/icons/map-menu/01-lokalitäten.svg";
import { SearchContext } from "../../../context/SearchContext";
import { UserContext } from "../../../context/UserContext";
import { OsmEntityMapper } from "../../../../../shared/types/osm-entity-mapper";
import { getOsmCategories } from "../../../shared/pois.functions";

interface ILocalitiesProps {
  toggleAllLocalities: () => void;
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  mapDisplayMode: MapDisplayModesEnum;
  backgroundColor: string;
  userMenuPoiIcons?: IApiUserPoiIcon[];
}

const Localities: FC<ILocalitiesProps> = ({
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mapDisplayMode,
  backgroundColor,
  userMenuPoiIcons,
}) => {
  const { t } = useTranslation();
  const {
    userState: { user },
  } = useContext(UserContext);
  const {
    searchContextState: {
      entityGroupsByActMeans: groupedEntries,
      responseConfig: config,
    },
  } = useContext(SearchContext);

  const resultingPoiIcons = userMenuPoiIcons || user?.poiIcons?.menuPoiIcons;
  const isEditorMode = mapDisplayMode === MapDisplayModesEnum.EDITOR;

  const [isLocalitiesOpen, setIsLocalitiesOpen] = useState(!isEditorMode);

  const osmEntityMapper = new OsmEntityMapper();

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
            <div className="collapse-title-text-1">
              {t(IntlKeys.snapshotEditor.pointsOfInterest.label)}
            </div>
          </div>
        </div>
        <label className="cursor-pointer label justify-start pl-0">
          <input
            type="checkbox"
            checked={groupedEntries.some((e) => e.active)}
            className="checkbox checkbox-sm z-1"
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
                [OsmName.favorite, OsmName.property].includes(
                  ge.name as OsmName
                )
            )
            .map((ge, geIndex) => {
              const isRealEstateListing = ge.name === OsmName.property;
              const isPreferredLocation = ge.name === OsmName.favorite;

              const groupIconInfo: IPoiIcon = isRealEstateListing
                ? !!config?.mapIcon
                  ? { icon: config.mapIcon, color: "transparent" }
                  : getRealEstateListingsIcon(resultingPoiIcons)
                : isPreferredLocation
                ? getPreferredLocationsIcon(resultingPoiIcons)
                : deriveIconForPoiGroup(ge.name, resultingPoiIcons);

              return (
                <div>
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
                    key={`${ge.name}-${geIndex}-map-menu-list-item-top`}
                  />
                </div>
              );
            })}

          {/* POIs */}
          {getOsmCategories().map(({ category, title }) => {
            return (
              <div key={`container-${category}`}>
                {groupedEntries.some(
                  ({ items, name }) =>
                    osmEntityMapper.getByGroupName(name)[0]?.category ===
                      category && items.length
                ) && (
                  <li className="locality-option-heading" key={category}>
                    <h4>{title}</h4>
                  </li>
                )}
                {groupedEntries
                  .filter(
                    ({ items, name }) =>
                      osmEntityMapper.getByGroupName(name)[0]?.category ===
                        category && items.length
                  )
                  .map((ge, geIndex) => {
                    const groupIconInfo: IPoiIcon = deriveIconForPoiGroup(
                      ge.name,
                      resultingPoiIcons
                    );

                    return (
                      <MapMenuListItem
                        entityGroup={ge}
                        groupIcon={groupIconInfo}
                        isCustomIcon={groupIconInfo.isCustom}
                        entityGroupIndex={geIndex}
                        routes={routes}
                        toggleRoute={toggleRoute}
                        transitRoutes={transitRoutes}
                        toggleTransitRoute={toggleTransitRoute}
                        key={`${ge.name}-${geIndex}-map-menu-list-item`}
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

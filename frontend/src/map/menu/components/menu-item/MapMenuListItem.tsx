import { FunctionComponent, useContext, useState } from "react";

import {
  EntityGroup,
  ResultEntity,
} from "../../../../shared/search-result.types";
import { MeansOfTransportation } from "../../../../../../shared/types/types";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../../shared/types/routing";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../context/SearchContext";
import CategoryContent from "./CategoryContent";
import { IPoiIcon } from "../../../../shared/shared.types";
import {
  realEstateListingsTitle,
  realEstateListingsTitleEmbed,
} from "../../../../../../shared/constants/real-estate";

export interface MapMenuListItemProps {
  entityGroup: EntityGroup;
  groupIcon: IPoiIcon;
  isCustomIcon?: boolean;
  entityGroupIndex: number;
  routes: EntityRoute[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  transitRoutes: EntityTransitRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
}

const MapMenuListItem: FunctionComponent<MapMenuListItemProps> = ({
  entityGroup,
  groupIcon,
  isCustomIcon,
  entityGroupIndex,
  routes,
  toggleRoute,
  transitRoutes,
  toggleTransitRoute,
}) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const {
    searchContextState: { responseConfig: config },
    searchContextDispatch,
  } = useContext(SearchContext);
  const imgClass = isCustomIcon ? "item-custom" : "item";

  const checkboxPrimaryClasses = !!config?.primaryColor
    ? "checkbox checkbox-custom checkbox-sm"
    : "checkbox checkbox-primary checkbox-sm";

  return (
    <li
      className="locality-option-li"
      key={`grouped-entry-${entityGroup.title}-${entityGroupIndex}`}
    >
      <div
        className={
          "collapse collapse-arrow locality-option" +
          (isListOpen ? " collapse-child-open" : " collapse-child-closed")
        }
      >
        <input
          type="checkbox"
          onChange={() => {
            setIsListOpen(!isListOpen);
          }}
        />
        <div className="collapse-title">
          <div
            onClick={() => {
              setIsListOpen(!isListOpen);
            }}
          >
            <div
              className={`img-container${
                isCustomIcon ? "" : " mask mask-circle"
              }`}
              style={{ background: groupIcon.color }}
            >
              <img className={imgClass} src={groupIcon.icon} alt="group-icon" />
            </div>
            {entityGroup.title === realEstateListingsTitle
              ? realEstateListingsTitleEmbed
              : entityGroup.title}{" "}
            [{entityGroup.items.length}]
          </div>
          <label className="cursor-pointer label justify-start pl-0">
            <input
              type="checkbox"
              checked={entityGroup.active}
              className={checkboxPrimaryClasses}
              onChange={() => {
                if (config?.defaultActiveGroups?.length) {
                  const isGroupFound = config.defaultActiveGroups.some(
                    (groupName) => groupName === entityGroup.title
                  );

                  if (isGroupFound) {
                    config.defaultActiveGroups =
                      config.defaultActiveGroups.filter(
                        (groupName) => groupName !== entityGroup.title
                      );
                  } else {
                    config.defaultActiveGroups.push(entityGroup.title);
                  }
                }

                searchContextDispatch({
                  type: SearchContextActionTypes.TOGGLE_RESPONSE_GROUP,
                  payload: entityGroup.title,
                });

                searchContextDispatch({
                  type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
                  payload: config,
                });
              }}
            />
          </label>
        </div>
        <CategoryContent
          entityGroup={entityGroup}
          routes={routes}
          toggleRoute={toggleRoute}
          transitRoutes={transitRoutes}
          toggleTransitRoute={toggleTransitRoute}
          isListOpen={isListOpen}
        />
      </div>
    </li>
  );
};

export default MapMenuListItem;

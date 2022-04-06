import "./MapMenuListItem.scss";
import {
  EntityGroup,
  ResultEntity
} from "../../../components/SearchResultContainer";
import {
  realEstateListingsTitle,
  realEstateListingsTitleEmbed
} from "../../../shared/shared.functions";
import distanceIcon from "../../../assets/icons/icons-32-x-32-illustrated-ic-distance.svg";
import walkIcon from "../../../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "../../../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../../../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import LocalityItem from "./locality-item/LocalityItem";
import React, { useContext, useState } from "react";
import {
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation
} from "../../../../../shared/types/types";
import {
  EntityRoute,
  EntityTransitRoute
} from "../../../../../shared/types/routing";
import {
  SearchContext,
  SearchContextActionTypes
} from "../../../context/SearchContext";

export interface MapMenuListItemProps {
  entityGroup: EntityGroup;
  groupIcon: any;
  customIcon?: boolean;
  entityGroupIndex: number;
  routes: EntityRoute[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  transitRoutes: EntityTransitRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  config?: ApiSearchResultSnapshotConfig | undefined;
}

const MapMenuListItem: React.FunctionComponent<MapMenuListItemProps> = ({
  entityGroup,
  groupIcon,
  customIcon,
  entityGroupIndex,
  routes,
  toggleRoute,
  transitRoutes,
  toggleTransitRoute,
  config
}) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [localityPagination, setLocalityPagination] = useState<number>(5);

  const { searchContextDispatch } = useContext(SearchContext);

  const imgClass = !customIcon ? "item" : "";

  const checkboxPrimaryClasses = !!config?.primaryColor
    ? "checkbox checkbox-custom checkbox-sm"
    : "checkbox checkbox-primary checkbox-sm";

  const highlightZoomEntity = (item: ResultEntity) => {
    searchContextDispatch({
      type: SearchContextActionTypes.CENTER_ZOOM_COORDINATES,
      payload: { center: item.coordinates, zoom: 18 }
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_HIGHLIGHT_ID,
      payload: item.id
    });
  };

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
        <input type="checkbox" onChange={() => setIsListOpen(!isListOpen)} />
        <div className="collapse-title">
          <div onClick={() => setIsListOpen(!isListOpen)}>
            <div
              className="img-container"
              style={{ background: groupIcon.color }}
            >
              <img
                className={imgClass}
                src={groupIcon.icon}
                alt="group-icon"
                onClick={() => setIsListOpen(!isListOpen)}
              />
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
              onChange={() =>
                searchContextDispatch({
                  type: SearchContextActionTypes.TOGGLE_RESPONSE_GROUP,
                  payload: entityGroup.title
                })
              }
            />
          </label>
        </div>
        <div className="collapse-content">
          <div className="mean-items">
            <div className="item">
              <img src={distanceIcon} alt="icon-distance" />
              Distanz
            </div>
            <div className="item">
              <img src={walkIcon} alt="icon-walk" />
              Fußweg
            </div>
            <div className="item">
              <img src={bicycleIcon} alt="icon-bicycle" />
              Fahrrad
            </div>
            <div className="item">
              <img src={carIcon} alt="icon-car" />
              Auto
            </div>
          </div>
          {isListOpen &&
            entityGroup.items
              .slice(0, localityPagination)
              .map((item, index) => (
                <LocalityItem
                  key={`${entityGroup.title}-${index}`}
                  item={item}
                  group={entityGroup}
                  onClickTitle={item => highlightZoomEntity(item)}
                  onToggleRoute={(item, mean) => toggleRoute(item, mean)}
                  route={routes?.find(
                    r =>
                      r.coordinates.lat === item.coordinates.lat &&
                      r.coordinates.lng === item.coordinates.lng &&
                      r.show
                  )}
                  onToggleTransitRoute={item => toggleTransitRoute(item)}
                  transitRoute={transitRoutes?.find(
                    tr =>
                      tr.coordinates.lat === item.coordinates.lat &&
                      tr.coordinates.lng === item.coordinates.lng &&
                      tr.show
                  )}
                />
              ))}
          {isListOpen && entityGroup.items.length > localityPagination && (
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setLocalityPagination(localityPagination + 5)}
            >
              Mehr anzeigen
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export default MapMenuListItem;

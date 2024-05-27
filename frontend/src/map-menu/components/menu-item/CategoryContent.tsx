import { FunctionComponent, useContext, useState } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import "./CategoryContent.scss";

import distanceIcon from "assets/icons/icons-32-x-32-illustrated-ic-distance.svg";
import walkIcon from "assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import {
  EntityGroup,
  ResultEntity,
} from "../../../shared/search-result.types";
import LocalityItem from "./locality-item/LocalityItem";
import { MeansOfTransportation } from "../../../../../shared/types/types";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../context/SearchContext";

interface ICategoryContentProps {
  entityGroup: EntityGroup;
  routes: EntityRoute[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  transitRoutes: EntityTransitRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  isListOpen?: boolean;
}

const CategoryContent: FunctionComponent<ICategoryContentProps> = ({
  entityGroup,
  routes,
  toggleRoute,
  transitRoutes,
  toggleTransitRoute,
  isListOpen = false,
}) => {
  const { t } = useTranslation();
  const [localityPagination, setLocalityPagination] = useState<number>(5);
  const { searchContextDispatch } = useContext(SearchContext);

  const highlightZoomEntity = (item: ResultEntity) => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_MAP_CENTER_ZOOM,
      payload: { mapCenter: item.coordinates, mapZoomLevel: 18 },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_HIGHLIGHT_ID,
      payload: item.id,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.GOTO_MAP_CENTER,
      payload: { goto: true, withZoom: true },
    });
  };

  return (
    <div className="collapse-content">
      <div className="mean-items">
        <div>
          <img src={distanceIcon} alt="icon-distance" />
          {t(IntlKeys.snapshotEditor.pointsOfInterest.distance)}
        </div>
        <div>
          <img src={walkIcon} alt="icon-walk" />
          {t(IntlKeys.snapshotEditor.pointsOfInterest.footpath)}
        </div>
        <div>
          <img src={bicycleIcon} alt="icon-bicycle" />
          {t(IntlKeys.snapshotEditor.pointsOfInterest.bicycle)}
        </div>
        <div>
          <img src={carIcon} alt="icon-car" />
          {t(IntlKeys.snapshotEditor.pointsOfInterest.auto)}
        </div>
      </div>
      {isListOpen &&
        entityGroup.items.slice(0, localityPagination).map((item, i) => (
          <LocalityItem
            key={`${entityGroup.title}-${i}`}
            item={item}
            group={entityGroup}
            onClickTitle={(item) => {
              highlightZoomEntity(item);
            }}
            onToggleRoute={(item, mean) => toggleRoute(item, mean)}
            route={routes?.find(
              (r) =>
                r.coordinates.lat === item.coordinates.lat &&
                r.coordinates.lng === item.coordinates.lng &&
                r.show
            )}
            onToggleTransitRoute={(item) => toggleTransitRoute(item)}
            transitRoute={transitRoutes?.find(
              (tr) =>
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
          onClick={() => {
            setLocalityPagination(localityPagination + 5);
          }}
        >
          {t(IntlKeys.common.showMore)}
        </button>
      )}
    </div>
  );
};

export default CategoryContent;

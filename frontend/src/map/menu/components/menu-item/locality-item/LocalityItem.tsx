import { FunctionComponent } from "react";

import "./LocalityItem.scss";

import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../../../shared/types/routing";
import {
  MeansOfTransportation,
  OsmName,
} from "../../../../../../../shared/types/types";
import {
  distanceToHumanReadable,
  timeToHumanReadable,
} from "../../../../../shared/shared.functions";
import {
  EntityGroup,
  ResultEntity,
} from "../../../../../shared/search-result.types";
import { convertMetersToMinutes } from "../../../../../../../shared/functions/shared.functions";

interface ILocalityItemProps {
  item: ResultEntity;
  group: EntityGroup;
  onClickTitle: (item: ResultEntity) => void;
  onToggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  route?: EntityRoute;
  onToggleTransitRoute: (item: ResultEntity) => void;
  transitRoute?: EntityTransitRoute;
}

const LocalityItem: FunctionComponent<ILocalityItemProps> = ({
  item,
  group,
  onClickTitle,
  onToggleRoute,
  route,
  onToggleTransitRoute,
  transitRoute,
}) => {
  return (
    <div
      className="locality-item"
      key={`locality-item-${group.title}-${item.id}`}
    >
      <h4
        className="locality-item-title cursor-pointer"
        onClick={() => onClickTitle(item)}
      >
        {item.name ?? group.title}
      </h4>
      {item.osmName === OsmName.favorite ? (
        <PreferredLocationItemContent
          item={item}
          onToggleRoute={(item, mean) => onToggleRoute(item, mean)}
          route={route}
          onToggleTransitRoute={() => onToggleTransitRoute(item)}
          transitRoute={transitRoute}
        />
      ) : (
        <LocalityItemContent item={item} />
      )}
    </div>
  );
};

export const PreferredLocationItemContent: FunctionComponent<{
  item: ResultEntity;
  onToggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  route?: EntityRoute;
  onToggleTransitRoute: (item: ResultEntity) => void;
  transitRoute?: EntityTransitRoute;
}> = ({ item, onToggleRoute, route, onToggleTransitRoute, transitRoute }) => {
  const byFootDuration =
    route?.routes
      .find((r) => r.meansOfTransportation === MeansOfTransportation.WALK)
      ?.sections.map((s) => s.duration)
      .reduce((p, c) => p + c) ?? "-";

  const byCarDuration =
    route?.routes
      .find((r) => r.meansOfTransportation === MeansOfTransportation.CAR)
      ?.sections.map((s) => s.duration)
      .reduce((p, c) => p + c) ?? "-";

  const byBicycleDuration =
    route?.routes
      .find((r) => r.meansOfTransportation === MeansOfTransportation.BICYCLE)
      ?.sections.map((s) => s.duration)
      .reduce((p, c) => p + c) ?? "-";

  const transitDuration =
    transitRoute?.route.sections
      .map((s) => s.duration)
      .reduce((p, c) => p + c) ?? "-";

  return (
    <>
      <div className="locality-item-content">
        <div className="col-span-full font-bold pl-2 pb-2">Routen & Zeiten</div>
        <label key="foot-checkbox-selection">
          <input
            type="checkbox"
            checked={route?.show.includes(MeansOfTransportation.WALK) || false}
            onChange={(event) =>
              onToggleRoute(item, MeansOfTransportation.WALK)
            }
            className="checkbox checkbox-primary checkbox-xs"
          />{" "}
          <span className="label-text">Zu Fuß</span>
        </label>
        <label key="bike-checkbox-selection">
          <input
            type="checkbox"
            checked={
              route?.show.includes(MeansOfTransportation.BICYCLE) || false
            }
            onChange={(event) =>
              onToggleRoute(item, MeansOfTransportation.BICYCLE)
            }
            className="checkbox checkbox-accent checkbox-xs"
          />{" "}
          <span className="label-text">Fahrrad</span>
        </label>
        <label key="car-checkbox-selection">
          <input
            type="checkbox"
            checked={route?.show.includes(MeansOfTransportation.CAR) || false}
            onChange={(event) => onToggleRoute(item, MeansOfTransportation.CAR)}
            className="checkbox checkbox-xs"
          />{" "}
          <span className="label-text">Auto</span>
        </label>
        <label key="census-data-checkbox-selection">
          <input
            type="checkbox"
            checked={transitRoute?.show || false}
            onChange={(event) => onToggleTransitRoute(item)}
            className="checkbox checkbox-secondary checkbox-xs"
          />{" "}
          <span className="label-text">ÖPNV</span>
        </label>
      </div>

      {((route?.show.length || []) > 0 || transitRoute?.show) && (
        <div className="locality-item-content">
          {(route?.show.length || []) > 0 && (
            <>
              <div className="locality-item-cell">
                <span className="locality-item-cell-label">Luftlinie</span>
                <span>{distanceToHumanReadable(item.distanceInMeters)}</span>
              </div>
              {route?.show.includes(MeansOfTransportation.WALK) && (
                <div className="locality-item-cell">
                  <span className="locality-item-cell-label">Fußweg</span>
                  <span>
                    {Number.isNaN(Number(byFootDuration))
                      ? byFootDuration
                      : timeToHumanReadable(byFootDuration as number)}
                  </span>
                </div>
              )}
              {route?.show.includes(MeansOfTransportation.BICYCLE) && (
                <div className="locality-item-cell">
                  <span className="locality-item-cell-label">Fahrrad</span>
                  <span>
                    {Number.isNaN(Number(byBicycleDuration))
                      ? byBicycleDuration
                      : timeToHumanReadable(byBicycleDuration as number)}
                  </span>
                </div>
              )}
              {route?.show.includes(MeansOfTransportation.CAR) && (
                <div className="locality-item-cell">
                  <span className="locality-item-cell-label">Auto</span>
                  <span>
                    {Number.isNaN(Number(byCarDuration))
                      ? byCarDuration
                      : timeToHumanReadable(byCarDuration as number)}
                  </span>
                </div>
              )}
            </>
          )}
          {transitRoute?.show && (
            <div className="locality-item-cell">
              <span className="locality-item-cell-label">ÖPNV</span>
              <span>
                {Number.isNaN(Number(transitDuration))
                  ? transitDuration
                  : timeToHumanReadable(transitDuration as number)}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export const LocalityItemContent: FunctionComponent<{
  item: ResultEntity;
}> = ({ item }) => {
  return (
    <div className="locality-item-content">
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">Luftlinie</span>
        <span>{distanceToHumanReadable(item.distanceInMeters)}</span>
      </div>
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">Fußweg</span>
        <span>
          {timeToHumanReadable(
            convertMetersToMinutes(
              item.distanceInMeters,
              MeansOfTransportation.WALK
            )
          )}
        </span>
      </div>
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">Fahrrad</span>
        <span>
          {timeToHumanReadable(
            convertMetersToMinutes(
              item.distanceInMeters,
              MeansOfTransportation.BICYCLE
            )
          )}
        </span>
      </div>
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">Auto</span>
        <span>
          {timeToHumanReadable(
            convertMetersToMinutes(
              item.distanceInMeters,
              MeansOfTransportation.CAR
            )
          )}
        </span>
      </div>
    </div>
  );
};

export default LocalityItem;

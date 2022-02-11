import React from "react";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import { MeansOfTransportation, OsmName } from "../../../shared/types/types";
import {
  deriveMinutesFromMeters,
  distanceToHumanReadable,
  timeToHumanReadable
} from "../shared/shared.functions";
import {
  EntityGroup,
  ResultEntity
} from "./SearchResultContainer";

export interface LocalityItemProps {
  item: ResultEntity;
  group: EntityGroup;
  onClickTitle: (item: ResultEntity) => void;
  onToggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  route?: EntityRoute;
  onToggleTransitRoute: (item: ResultEntity) => void;
  transitRoute?: EntityTransitRoute;
}

const LocalityItem: React.FunctionComponent<LocalityItemProps> = ({
  item,
  group,
  onClickTitle,
  onToggleRoute,
  route,
  onToggleTransitRoute,
  transitRoute
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
      {item.type === OsmName.favorite ? (
        <PreferredLocationItemContent
          item={item}
          onToggleRoute={(item, mean) => onToggleRoute(item, mean)}
          onToggleTransitRoute={() => onToggleTransitRoute(item)}
          route={route}
          transitRoute={transitRoute}
        />
      ) : (
        <LocalityItemContent item={item} />
      )}
    </div>
  );
};
const PreferredLocationItemContent: React.FunctionComponent<{
  item: ResultEntity;
  onToggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  route?: EntityRoute;
  onToggleTransitRoute: (item: ResultEntity) => void;
  transitRoute?: EntityTransitRoute;
}> = ({ item, onToggleRoute, route, onToggleTransitRoute, transitRoute }) => {
  const byFootDuration =
    route?.routes
      .find(r => r.meansOfTransportation === MeansOfTransportation.WALK)
      ?.sections.map(s => s.duration)
      .reduce((p, c) => p + c) ?? "-";
  const byCarDuration =
    route?.routes
      .find(r => r.meansOfTransportation === MeansOfTransportation.CAR)
      ?.sections.map(s => s.duration)
      .reduce((p, c) => p + c) ?? "-";
  const byBicycleDuration =
    route?.routes
      .find(r => r.meansOfTransportation === MeansOfTransportation.BICYCLE)
      ?.sections.map(s => s.duration)
      .reduce((p, c) => p + c) ?? "-";
  const transitDuration =
    transitRoute?.route.sections.map(s => s.duration).reduce((p, c) => p + c) ??
    "-";

  return (
    <>
      <div className="locality-item-content">
        <div className="flex flex-col gap-2">
          <div className="font-bold">Routen & Zeiten</div>
          <div className="flex flex-wrap gap-2 items-center">
            <label
              className="cursor-pointer label justify-start gap-2 items-center"
              key="foot-checkbox-selection"
            >
              <input
                type="checkbox"
                checked={route?.show.includes(MeansOfTransportation.WALK)}
                onChange={event =>
                  onToggleRoute(item, MeansOfTransportation.WALK)
                }
                className="checkbox checkbox-primary checkbox-xs"
              />{" "}
              <span className="label-text">Zu Fuß</span>
            </label>
            <label
              className="cursor-pointer label justify-start gap-2 items-center"
              key="bike-checkbox-selection"
            >
              <input
                type="checkbox"
                checked={route?.show.includes(MeansOfTransportation.BICYCLE)}
                onChange={event =>
                  onToggleRoute(item, MeansOfTransportation.BICYCLE)
                }
                className="checkbox checkbox-accent checkbox-xs"
              />{" "}
              <span className="label-text">Fahrrad</span>
            </label>
            <label
              className="cursor-pointer label justify-start gap-2 items-center"
              key="car-checkbox-selection"
            >
              <input
                type="checkbox"
                checked={route?.show.includes(MeansOfTransportation.CAR)}
                onChange={event =>
                  onToggleRoute(item, MeansOfTransportation.CAR)
                }
                className="checkbox checkbox-xs"
              />{" "}
              <span className="label-text">Auto</span>
            </label>
            <label
              className="cursor-pointer label justify-start gap-2 items-center"
              key="census-data-checkbox-selection"
            >
              <input
                type="checkbox"
                checked={transitRoute?.show || false}
                onChange={event => onToggleTransitRoute(item)}
                className="checkbox checkbox-secondary checkbox-xs"
              />{" "}
              <span className="label-text">ÖPNV</span>
            </label>
          </div>
        </div>
      </div>

      <div className="locality-item-content">
        {(route?.show.length || []) > 0 && (
          <>
            <div className="locality-item-cell">
              <span className="locality-item-cell-label">Distanz</span>
              <span>{distanceToHumanReadable(item.distanceInMeters)}</span>
            </div>
            {route?.show.includes(MeansOfTransportation.WALK) && (
              <div className="locality-item-cell">
                <span className="locality-item-cell-label">Fußweg</span>
                <span>
                  {Number.isNaN(byFootDuration)
                    ? byFootDuration
                    : timeToHumanReadable(byFootDuration as number)}
                </span>
              </div>
            )}
            {route?.show.includes(MeansOfTransportation.BICYCLE) && (
              <div className="locality-item-cell">
                <span className="locality-item-cell-label">Fahrrad</span>
                <span>
                  {Number.isNaN(byBicycleDuration)
                    ? byBicycleDuration
                    : timeToHumanReadable(byBicycleDuration as number)}
                </span>
              </div>
            )}
            {route?.show.includes(MeansOfTransportation.CAR) && (
              <div className="locality-item-cell">
                <span className="locality-item-cell-label">Auto</span>
                <span>
                  {Number.isNaN(byCarDuration)
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
              {Number.isNaN(transitDuration)
                ? transitDuration
                : timeToHumanReadable(transitDuration as number)}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

const LocalityItemContent: React.FunctionComponent<{ item: ResultEntity }> = ({
  item
}) => {
  return (
    <div className="locality-item-content">
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">Distanz</span>
        <span>{distanceToHumanReadable(item.distanceInMeters)}</span>
      </div>
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">Fußweg</span>
        <span>
          {timeToHumanReadable(
            deriveMinutesFromMeters(
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
            deriveMinutesFromMeters(
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
            deriveMinutesFromMeters(
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

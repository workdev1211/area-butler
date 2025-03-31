import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./LocalityItem.scss";

import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../../shared/types/routing";
import {
  MeansOfTransportation,
  OsmName,
} from "../../../../../../shared/types/types";
import {
  distanceToHumanReadable,
  timeToHumanReadable,
} from "../../../../shared/shared.functions";
import {
  EntityGroup,
  ResultEntity,
} from "../../../../shared/search-result.types";
import { convertMetersToMinutes } from "../../../../../../shared/functions/shared.functions";

interface ILocalityItemProps {
  item: ResultEntity;
  group: EntityGroup;
  onClickTitle: (item: ResultEntity) => void;
  onToggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  route?: EntityRoute;
  onToggleTransitRoute: (item: ResultEntity) => void;
  transitRoute?: EntityTransitRoute;
}

const LocalityItem: FC<ILocalityItemProps> = ({
  item,
  group,
  onClickTitle,
  onToggleRoute,
  route,
  onToggleTransitRoute,
  transitRoute,
}) => {
  const { t } = useTranslation();

  const itemName =
    item.name ??
    t(
      (IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>)[
        group.name
      ]
    );

  return (
    <div
      className="locality-item"
      key={`locality-item-${group.name}-${item.id}`}
    >
      <h4
        className="locality-item-title cursor-pointer"
        onClick={() => onClickTitle(item)}
      >
        {itemName}
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

export const PreferredLocationItemContent: FC<{
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

  // TODO refactor to 'reduce'
  const transitDuration =
    transitRoute?.route.sections
      .map((s) => s.duration)
      .reduce((p, c) => p + c) ?? "-";

  return (
    <>
      <div className="locality-item-content">
        {/* TODO translation required */}
        <div className="col-span-full font-bold pl-2 pb-2">Routes & Times</div>
        <label key="foot-checkbox-selection">
          <input
            type="checkbox"
            checked={route?.show.includes(MeansOfTransportation.WALK) || false}
            onChange={() => {
              onToggleRoute(item, MeansOfTransportation.WALK);
            }}
            className="checkbox checkbox-primary checkbox-xs"
          />{" "}
          {/* TODO translation required */}
          <span className="label-text">Zu Fuß</span>
        </label>
        <label key="bike-checkbox-selection">
          <input
            type="checkbox"
            checked={
              route?.show.includes(MeansOfTransportation.BICYCLE) || false
            }
            onChange={() => {
              onToggleRoute(item, MeansOfTransportation.BICYCLE);
            }}
            className="checkbox checkbox-accent checkbox-xs"
          />{" "}
          {/* TODO translation required */}
          <span className="label-text">Fahrrad</span>
        </label>
        <label key="car-checkbox-selection">
          <input
            type="checkbox"
            checked={route?.show.includes(MeansOfTransportation.CAR) || false}
            onChange={() => {
              onToggleRoute(item, MeansOfTransportation.CAR);
            }}
            className="checkbox checkbox-xs"
          />{" "}
          <span className="label-text">Auto</span>
        </label>
        <label key="census-data-checkbox-selection">
          <input
            type="checkbox"
            checked={transitRoute?.show || false}
            onChange={() => {
              onToggleTransitRoute(item);
            }}
            className="checkbox checkbox-secondary checkbox-xs"
          />{" "}
          {/* TODO translation required */}
          <span className="label-text">ÖPNV</span>
        </label>
      </div>

      {((route?.show || []).length > 0 || transitRoute?.show) && (
        <div className="locality-item-content">
          {(route?.show || []).length > 0 && (
            <>
              <div className="locality-item-cell">
                {/* TODO translation required */}
                <span className="locality-item-cell-label">Straight Line</span>
                <span>{distanceToHumanReadable(item.distanceInMeters)}</span>
              </div>
              {route?.show.includes(MeansOfTransportation.WALK) && (
                <div className="locality-item-cell">
                  {/* TODO translation required */}
                  <span className="locality-item-cell-label">Footpath</span>
                  <span>
                    {Number.isNaN(Number(byFootDuration))
                      ? byFootDuration
                      : timeToHumanReadable(byFootDuration as number)}
                  </span>
                </div>
              )}
              {route?.show.includes(MeansOfTransportation.BICYCLE) && (
                <div className="locality-item-cell">
                  {/* TODO translation required */}
                  <span className="locality-item-cell-label">Bicycle</span>
                  <span>
                    {Number.isNaN(Number(byBicycleDuration))
                      ? byBicycleDuration
                      : timeToHumanReadable(byBicycleDuration as number)}
                  </span>
                </div>
              )}
              {route?.show.includes(MeansOfTransportation.CAR) && (
                <div className="locality-item-cell">
                  {/* TODO translation required */}
                  <span className="locality-item-cell-label">Car</span>
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
              {/* TODO translation required */}
              <span className="locality-item-cell-label">Public Transport</span>
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

export const LocalityItemContent: FC<{
  item: ResultEntity;
}> = ({ item }) => {
  const { t } = useTranslation();

  return (
    <div className="locality-item-content">
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">
          {t(IntlKeys.snapshotEditor.pointsOfInterest.distance)}
        </span>
        <span>{distanceToHumanReadable(item.distanceInMeters)}</span>
      </div>
      <div className="locality-item-cell">
        <span className="locality-item-cell-label">
          {t(IntlKeys.snapshotEditor.pointsOfInterest.footpath)}
        </span>
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
        <span className="locality-item-cell-label">
          {t(IntlKeys.snapshotEditor.pointsOfInterest.bicycle)}
        </span>
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
        <span className="locality-item-cell-label">
          {t(IntlKeys.snapshotEditor.pointsOfInterest.auto)}
        </span>
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

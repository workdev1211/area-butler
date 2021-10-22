import { EntityGroup, ResultEntity } from "pages/SearchResultPage";
import React from "react";
import { calculateMinutesToMeters } from "../../../shared/constants/constants";
import { MeansOfTransportation } from "../../../shared/types/types";

export interface EntityTableProps {
  entityGroup: EntityGroup;
  limit?: number;
  showRoutingColumns?: boolean;
}
const deriveMinutesFromMeters = (
  distanceInMeters: number,
  mean: MeansOfTransportation
) => {
  return (
    distanceInMeters /
    (calculateMinutesToMeters.find((mtm) => mtm.mean === mean)?.multiplicator ||
      1)
  );
};

export const EntityTable: React.FunctionComponent<EntityTableProps> = ({
  entityGroup,
  limit = 10,
  showRoutingColumns = true,
}) => {
  const items = [...entityGroup.items].slice(0, limit);
  const hasNames = items.some((item) => item.name && item.name.length);
  const byFoot = items.some((item) => item.byFoot);
  const byBike = items.some((item) => item.byBike);
  const byCar = items.some((item) => item.byCar);

  return (
    <div>
      <h1 className="text-xl ml-2 font-bold">{entityGroup.title}</h1>
      <table className="table w-full mt-5">
        <thead>
          <tr>
            {hasNames && <th className="pr-4 py-1 text-left">Name</th>}
            <th className={hasNames ? "px-4 py-1 text-left" : "py-1 text-left"}>
              Entfernung
            </th>
            {showRoutingColumns && byFoot && (
              <th className="px-4 py-1 text-left">Zu Fuß</th>
            )}
            {showRoutingColumns && byBike && (
              <th className="px-4 py-1 text-left">Fahrrad</th>
            )}
            {showRoutingColumns && byCar && (
              <th className="px-4 py-1 text-left">Auto</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.filter((item: ResultEntity) => item.selected).map((item: ResultEntity) => (
            <tr
              key={
                "result-table-" +
                entityGroup.title +
                "-" +
                item.name +
                item.distanceInMeters
              }
            >
              {hasNames && <td className="pr-4 py-1">{item.name || "-"}</td>}
              <td className={hasNames ? "px-4 py-1" : "py-1"}>
                {item.distanceInMeters
                  ? Math.trunc(item.distanceInMeters) + " m"
                  : "unbekannt"}
              </td>
              {showRoutingColumns && byFoot && (
                <td className="px-4 py-1">
                  {item.byFoot
                    ? `${Math.trunc(
                        deriveMinutesFromMeters(
                          item.distanceInMeters,
                          MeansOfTransportation.WALK
                        )
                      )} min`
                    : ""}
                </td>
              )}
              {showRoutingColumns && byBike && (
                <td className="px-4 py-1">
                  {item.byBike
                    ? `${Math.trunc(
                        deriveMinutesFromMeters(
                          item.distanceInMeters,
                          MeansOfTransportation.BICYCLE
                        )
                      )} min`
                    : ""}
                </td>
              )}
              {showRoutingColumns && byCar && (
                <td className="px-4 py-1">
                  {item.byCar
                    ? `${Math.trunc(
                        deriveMinutesFromMeters(
                          item.distanceInMeters,
                          MeansOfTransportation.CAR
                        )
                      )} min`
                    : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

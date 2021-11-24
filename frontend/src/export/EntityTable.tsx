import { EntityGroup, ResultEntity } from "pages/SearchResultPage";
import "./EntityTable.css";
import React from "react";
import { calculateMinutesToMeters } from "../../../shared/constants/constants";
import { MeansOfTransportation } from "../../../shared/types/types";

export interface EntityTableProps {
  entityGroup: EntityGroup;
  limit?: number;
  showRoutingColumns?: boolean;
  primaryColor?: string;
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
  primaryColor = '#aa0c54'
}) => {
  const items = [...entityGroup.items].slice(0, limit);
  const hasNames = items.some((item) => item.name && item.name.length);
  const byFoot = items.some((item) => item.byFoot);
  const byBike = items.some((item) => item.byBike);
  const byCar = items.some((item) => item.byCar);

  const tableHeaderStyle = {
    backgroundColor: primaryColor
  }

  return (
    <div>
      <table className="entity-table">
        <thead >
          <tr style={tableHeaderStyle}>
            {hasNames && <th>Name</th>}
            <th>
              Entfernung
            </th>
            {showRoutingColumns && byFoot && (
              <th>Zu Fuß</th>
            )}
            {showRoutingColumns && byBike && (
              <th>Fahrrad</th>
            )}
            {showRoutingColumns && byCar && (
              <th>Auto</th>
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
              {hasNames && <td>{item.name || entityGroup.title}</td>}
              <td>
                {item.distanceInMeters
                  ? Math.trunc(item.distanceInMeters) + " m"
                  : "unbekannt"}
              </td>
              {showRoutingColumns && byFoot && (
                <td>
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
                <td>
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
                <td>
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

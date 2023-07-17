import { FunctionComponent } from "react";

import "./EntityTable.scss";

import { MeansOfTransportation } from "../../../shared/types/types";
import {
  deriveColorPalette,
  distanceToHumanReadable,
  timeToHumanReadable,
} from "shared/shared.functions";
import { EntityGroup, ResultEntity } from "../components/SearchResultContainer";
import { convertMetersToMinutes } from "../../../shared/functions/shared.functions";

export interface EntityTableProps {
  entityGroup: EntityGroup;
  activeMeans: MeansOfTransportation[];
  limit?: number;
  showRoutingColumns?: boolean;
  primaryColor?: string;
}

export const EntityTable: FunctionComponent<EntityTableProps> = ({
  entityGroup,
  limit = 10,
  activeMeans,
  showRoutingColumns = true,
  primaryColor = "#aa0c54",
}) => {
  const items = [...entityGroup.items].slice(0, limit);
  const hasNames =
    items.some((item) => item.name && item.name.length) || entityGroup.title;
  const byFoot = items.some((item) => item.byFoot);
  const byBike = items.some((item) => item.byBike);
  const byCar = items.some((item) => item.byCar);

  const colorPalette = deriveColorPalette(primaryColor);

  const tableHeaderStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor,
  };

  return (
    <div>
      <table className="entity-table">
        <thead style={{ backgroundAttachment: "fixed" }}>
          <tr style={tableHeaderStyle}>
            {hasNames && <th>Name</th>}
            <th>Entfernung</th>
            {showRoutingColumns &&
              byFoot &&
              activeMeans.includes(MeansOfTransportation.WALK) && (
                <th>Zu Fuß</th>
              )}
            {showRoutingColumns &&
              byBike &&
              activeMeans.includes(MeansOfTransportation.BICYCLE) && (
                <th>Fahrrad</th>
              )}
            {showRoutingColumns &&
              byCar &&
              activeMeans.includes(MeansOfTransportation.CAR) && <th>Auto</th>}
          </tr>
        </thead>
        <tbody>
          {items
            .filter((item: ResultEntity) => item.selected)
            .map((item: ResultEntity) => (
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
                    ? distanceToHumanReadable(item.distanceInMeters)
                    : "unbekannt"}
                </td>
                {showRoutingColumns &&
                  byFoot &&
                  activeMeans.includes(MeansOfTransportation.WALK) && (
                    <td>
                      {item.byFoot
                        ? `${timeToHumanReadable(
                            convertMetersToMinutes(
                              item.distanceInMeters,
                              MeansOfTransportation.WALK
                            )
                          )}`
                        : ""}
                    </td>
                  )}
                {showRoutingColumns &&
                  byBike &&
                  activeMeans.includes(MeansOfTransportation.BICYCLE) && (
                    <td>
                      {item.byBike
                        ? `${timeToHumanReadable(
                            convertMetersToMinutes(
                              item.distanceInMeters,
                              MeansOfTransportation.BICYCLE
                            )
                          )}`
                        : ""}
                    </td>
                  )}
                {showRoutingColumns &&
                  byCar &&
                  activeMeans.includes(MeansOfTransportation.CAR) && (
                    <td>
                      {item.byCar
                        ? `${timeToHumanReadable(
                            convertMetersToMinutes(
                              item.distanceInMeters,
                              MeansOfTransportation.CAR
                            )
                          )}`
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

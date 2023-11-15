import { FunctionComponent } from "react";

import "./EntityTable.scss";
import {
  meansOfTransportations,
  unitsOfTransportation,
} from "../../../shared/constants/constants";
import {
  MeansOfTransportation,
  TransportationParam,
} from "../../../shared/types/types";
import {
  deriveColorPalette,
  distanceToHumanReadable,
} from "shared/shared.functions";
import { EntityGroup, ResultEntity } from "../shared/search-result.types";

interface IEntityGridSummaryProps {
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  primaryColor?: string;
}

export const routingProfileOrder = [
  MeansOfTransportation.WALK,
  MeansOfTransportation.BICYCLE,
  MeansOfTransportation.CAR,
];

export const EntityGridSummary: FunctionComponent<IEntityGridSummaryProps> = ({
  groupedEntries,
  transportationParams,
  primaryColor = "#aa0c54",
  activeMeans,
}) => {
  const byFootAvailable = transportationParams.some(
    (param) =>
      param.type === MeansOfTransportation.WALK &&
      activeMeans.includes(param.type)
  );
  const byBikeAvailable = transportationParams.some(
    (param) =>
      param.type === MeansOfTransportation.BICYCLE &&
      activeMeans.includes(param.type)
  );
  const byCarAvailable = transportationParams.some(
    (param) =>
      param.type === MeansOfTransportation.CAR &&
      activeMeans.includes(param.type)
  );

  const colorPalette = deriveColorPalette(primaryColor);

  const tableHeaderStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor,
    fontSize: "16px",
  };

  return (
    <div className="mx-10 my-5">
      <table className="entity-table">
        <thead style={{ backgroundAttachment: "fixed" }}>
          <tr style={tableHeaderStyle}>
            <th />
            <th>Nächster Ort</th>
            {transportationParams
              .filter((t) => activeMeans.includes(t.type))
              .sort(
                (t1, t2) =>
                  routingProfileOrder.indexOf(t1.type) -
                  routingProfileOrder.indexOf(t2.type)
              )
              .map((routingProfile: TransportationParam) => (
                <th key={`entity-grid-header-item-${routingProfile.type}`}>
                  <span>
                    {
                      meansOfTransportations.find(
                        (means) => means.type === routingProfile.type
                      )?.label
                    }{" "}
                    ({routingProfile.amount}{" "}
                    {
                      unitsOfTransportation.find(
                        (unit) => unit.type === routingProfile.unit
                      )?.label
                    }
                    )
                  </span>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {groupedEntries.map((group) => (
            <tr key={`entity-grid-item-${group.title}`}>
              <td>
                <h5 className="font-bold">{group.title}</h5>
              </td>
              <td>
                {distanceToHumanReadable(
                  Math.min(...group.items.map((d) => d.distanceInMeters))
                )}
              </td>
              {byFootAvailable && (
                <td>
                  {group.items.filter((d: ResultEntity) => d.byFoot).length}
                </td>
              )}
              {byBikeAvailable && (
                <td>
                  {group.items.filter((d: ResultEntity) => d.byBike).length}
                </td>
              )}
              {byCarAvailable && (
                <td>
                  {group.items.filter((d: ResultEntity) => d.byCar).length}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntityGridSummary;

import { EntityGroup, ResultEntity } from "pages/SearchResultPage";
import React from "react";
import "./EntityTable.css";
import {
  meansOfTransportations,
  unitsOfTransportation,
} from "../../../shared/constants/constants";
import {
  MeansOfTransportation,
  TransportationParam,
} from "../../../shared/types/types";

export interface EntityGridSummaryProps {
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  primaryColor?: string;
}

const routingProfileOrder = [
  MeansOfTransportation.WALK,
  MeansOfTransportation.BICYCLE,
  MeansOfTransportation.CAR,
];

export const EntityGridSummary: React.FunctionComponent<EntityGridSummaryProps> =
  ({ groupedEntries, transportationParams, primaryColor = '#aa0c54' }) => {
    const byFootAvailable = transportationParams.some(
      (param) => param.type === MeansOfTransportation.WALK
    );
    const byBikeAvailable = transportationParams.some(
      (param) => param.type === MeansOfTransportation.BICYCLE
    );
    const byCarAvailable = transportationParams.some(
      (param) => param.type === MeansOfTransportation.CAR
    );

    const tableHeaderStyle = {
      backgroundColor: primaryColor
    }

    return (
      <div className="m-10">
        <table className="entity-table">
          <thead>
            <tr style={tableHeaderStyle}>
              <th />
              {transportationParams
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
            {groupedEntries
              .filter((group) => group.active)
              .map((group) => (
                <tr key={`entity-grid-item-${group.title}`}>
                  <td>
                    <h5 className="font-bold">{group.title}</h5>
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

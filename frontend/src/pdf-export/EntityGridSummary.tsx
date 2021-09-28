import { fallbackIcon, osmNameToIcons } from "map/makiIcons";
import { FunctionComponent } from "react";
import { ResultEntity } from "search/SearchResult";
import {
  meansOfTransportations,
  unitsOfTransportation,
} from "../../../shared/constants/constants";
import {
  MeansOfTransportation,
  TransportationParam,
} from "../../../shared/types/types";

export interface EntityGridSummaryProps {
  groupedEntries: any;
  transportationParams: TransportationParam[];
}

const routingProfileOrder = [
  MeansOfTransportation.WALK,
  MeansOfTransportation.BICYCLE,
  MeansOfTransportation.CAR,
];

export const EntityGridSummary: FunctionComponent<EntityGridSummaryProps> = ({
  groupedEntries,
  transportationParams,
}) => {
  const byFootAvailable = transportationParams.some(
    (param) => param.type === MeansOfTransportation.WALK
  );
  const byBikeAvailable = transportationParams.some(
    (param) => param.type === MeansOfTransportation.BICYCLE
  );
  const byCarAvailable = transportationParams.some(
    (param) => param.type === MeansOfTransportation.CAR
  );

  return (
    <div className="m-10">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="w-48 bg-primary rounded"></div>
          {transportationParams
            .sort(
              (t1, t2) =>
                routingProfileOrder.indexOf(t1.type) -
                routingProfileOrder.indexOf(t2.type)
            )
            .map((routingProfile: TransportationParam) => (
              <div className="w-36 bg-primary rounded p-2 text-white flex gap-2 text-xs">
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
              </div>
            ))}
        </div>
        {groupedEntries.map(([label, data]: any) => (
          <div className="flex gap-2">
            <div className="w-48 bg-primary rounded p-2 text-white flex gap-2">
              <img
                alt="icon"
                src={
                  osmNameToIcons.find((entry) => entry.name === data[0].type)
                    ?.icon || fallbackIcon
                }
                className={data[0].type}
              />
              <h5 className="text-xs">{label}</h5>
            </div>
            {byFootAvailable && (
              <div className="w-36 bg-secondary rounded p-2 text-white flex gap-2 text-xs">
                {data.filter((d: ResultEntity) => d.byFoot).length}
              </div>
            )}
            {byBikeAvailable && (
              <div className="w-36 bg-secondary rounded p-2 text-white flex gap-2 text-xs">
                {data.filter((d: ResultEntity) => d.byBike).length}
              </div>
            )}
            {byCarAvailable && (
              <div className="w-36 bg-secondary rounded p-2 text-white flex gap-2 text-xs">
                {data.filter((d: ResultEntity) => d.byCar).length}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntityGridSummary;

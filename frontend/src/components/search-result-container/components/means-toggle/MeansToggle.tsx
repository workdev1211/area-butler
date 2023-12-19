import { FunctionComponent } from "react";

import "./MeansToggle.scss";
import {
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation,
} from "../../../../../../shared/types/types";
import walkIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";

export interface MapNavBarProps {
  transportationParams: TransportationParam[];
  availableMeans: MeansOfTransportation[];
  activeMeans: MeansOfTransportation[];
  onMeansChange: (newValues: MeansOfTransportation[]) => void;
  hideIsochrones: boolean;
}

const MeansToggle: FunctionComponent<MapNavBarProps> = ({
  transportationParams,
  availableMeans,
  activeMeans,
  onMeansChange,
  hideIsochrones,
}) => {
  const toggleMean = (mean: MeansOfTransportation) => {
    const newValues = activeMeans.includes(mean)
      ? activeMeans.filter((am) => am !== mean)
      : [...activeMeans, mean];

    onMeansChange(newValues);
  };

  const deriveBackgroundClass = (mean: MeansOfTransportation) => {
    switch (mean) {
      case MeansOfTransportation.WALK:
        return "bg-primary";
      case MeansOfTransportation.BICYCLE:
        return "bg-accent";
      case MeansOfTransportation.CAR:
        return "bg-base-content";
    }
  };

  return (
    <div className="map-nav-bar" data-tour="map-navbar">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {availableMeans.map((mean) => {
          const param = transportationParams.find((tp) => tp.type === mean);

          return (
            <button
              className={
                activeMeans.includes(mean)
                  ? "btn btn-link active"
                  : "btn btn-link"
              }
              onClick={() => {
                toggleMean(mean);
              }}
              key={`mean-${mean}`}
              data-testid={`means-toggle-${mean}`}
            >
              {!hideIsochrones && (
                <span className={deriveBackgroundClass(mean)} />
              )}
              {mean === MeansOfTransportation.WALK && (
                <img src={walkIcon} alt="iconwalk" />
              )}
              {mean === MeansOfTransportation.BICYCLE && (
                <img src={bicycleIcon} alt="iconbycicle" />
              )}
              {mean === MeansOfTransportation.CAR && (
                <img src={carIcon} alt="iconcar" />
              )}
              ({param?.amount}{" "}
              {param?.unit === UnitsOfTransportation.KILOMETERS ? "km" : "min"})
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MeansToggle;

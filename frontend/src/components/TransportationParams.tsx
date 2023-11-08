import { FunctionComponent } from "react";

import "./TransportationParams.scss";

import {
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation,
} from "../../../shared/types/types";
import { meansOfTransportations } from "../../../shared/constants/constants";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bikeIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import Input from "./inputs/formik/Input";
import distanceIcon from "../assets/icons/icons-16-x-16-outline-ic-distance.svg";
import { defaultTransportParams } from "../../../shared/constants/location";

export const transportationParamIcons = [
  {
    type: MeansOfTransportation.WALK,
    icon: walkIcon,
  },
  {
    type: MeansOfTransportation.BICYCLE,
    icon: bikeIcon,
  },
  {
    type: MeansOfTransportation.CAR,
    icon: carIcon,
  },
];

interface ITransportationParamsProps {
  values: TransportationParam[];
  onChange: (newValue: TransportationParam[]) => void;
}

const TransportationParams: FunctionComponent<ITransportationParamsProps> = ({
  values = [...defaultTransportParams],
  onChange = () => {},
}) => {
  const handleOnChange = (newValue: TransportationParam[]) => {
    onChange(newValue);
  };

  const setMeanValue = (
    newValue: any,
    unit: UnitsOfTransportation | undefined,
    mean: MeansOfTransportation
  ) => {
    const newParams = values.map((value) => {
      if (value.type !== mean) {
        return value;
      }

      if (Number.isNaN(newValue)) {
        return {
          ...value,
          amount: 1,
        };
      }

      return {
        ...value,
        amount:
          unit === UnitsOfTransportation.MINUTES
            ? Math.min(parseInt(newValue), 60)
            : Math.min(parseFloat(newValue), 10),
      };
    });

    handleOnChange(newParams);
  };

  const setMeanUnit = (newValue: string, mean: MeansOfTransportation) => {
    const newParams = values.map((value) => {
      if (value.type !== mean) {
        return value;
      }

      const unit =
        Object.values(UnitsOfTransportation).find((uot) => uot === newValue) ??
        UnitsOfTransportation.KILOMETERS;

      return {
        ...value,
        amount:
          unit === UnitsOfTransportation.MINUTES
            ? Math.min(value.amount, 60)
            : Math.min(value.amount, 10),
        unit,
      };
    });

    handleOnChange(newParams);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
      {meansOfTransportations.map((mean) => {
        const isActive = values.some((v) => v.type === mean.type);
        const currentValue = values.find((v) => v.type === mean.type);

        return (
          <div
            className="mean-of-transportation"
            key={`transportation-mean-${mean.type}`}
            data-tour={`transportation-type-${mean.type}`}
          >
            <div className="flex gap-4 justify-between">
              <div className="flex gap-6 items-center">
                <img
                  src={
                    transportationParamIcons.find(
                      (list) => list.type === mean.type
                    )?.icon
                  }
                  alt="mean-icon"
                />
                <span className="mean-label">{mean.label}</span>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isActive}
                  onChange={() => {
                    if (!isActive) {
                      handleOnChange([
                        ...values,
                        {
                          type: mean.type,
                          amount: 5,
                          unit: UnitsOfTransportation.MINUTES,
                        },
                      ]);
                    } else {
                      handleOnChange([
                        ...values.filter((value) => value.type !== mean.type),
                      ]);
                    }
                  }}
                />
              </label>
            </div>
            {isActive && (
              <div className="distance-unit flex gap-4 flex-wrap">
                <Input
                  name="distance"
                  icon={distanceIcon}
                  label="Erreichbar in"
                  type="number"
                  step={
                    currentValue?.unit === UnitsOfTransportation.MINUTES
                      ? "any"
                      : ".1"
                  }
                  value={currentValue?.amount ?? 1}
                  min={
                    currentValue?.unit === UnitsOfTransportation.MINUTES
                      ? 1
                      : 0.1
                  }
                  max={
                    currentValue?.unit === UnitsOfTransportation.MINUTES
                      ? 1000
                      : 100
                  }
                  onChange={(event) =>
                    setMeanValue(
                      event.target.value,
                      currentValue?.unit,
                      mean.type
                    )
                  }
                  className="input input-bordered flex"
                  placeholder={
                    currentValue?.unit === UnitsOfTransportation.MINUTES
                      ? "Minuten"
                      : "Kilometer"
                  }
                />
                <div className="form-control min-flex">
                  <label className="label">
                    <span>Einheit</span>
                  </label>
                  <select
                    className="select select-bordered flex"
                    value={currentValue?.unit}
                    onChange={(event) =>
                      setMeanUnit(event.target.value, mean.type)
                    }
                  >
                    <option value={UnitsOfTransportation.KILOMETERS}>
                      Kilometer
                    </option>
                    <option value={UnitsOfTransportation.MINUTES}>
                      Minuten
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TransportationParams;

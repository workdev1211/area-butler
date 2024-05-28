import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

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
  const { t } = useTranslation();
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
                <span className="mean-label">
                  {t((IntlKeys.environmentalAnalysis as Record<string, string>)[mean.mode])}
                </span>
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
                  label={t(IntlKeys.environmentalAnalysis.availableIn)}
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
                    <span>{t(IntlKeys.environmentalAnalysis.unit)}</span>
                  </label>
                  <select
                    className="select select-bordered flex"
                    value={currentValue?.unit}
                    onChange={(event) =>
                      setMeanUnit(event.target.value, mean.type)
                    }
                  >
                    <option value={UnitsOfTransportation.KILOMETERS}>
                      {t(IntlKeys.environmentalAnalysis.km)}
                    </option>
                    <option value={UnitsOfTransportation.MINUTES}>
                      {t(IntlKeys.environmentalAnalysis.min)}
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

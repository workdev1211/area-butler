import React from "react";
import {MeansOfTransportation, TransportationParam, UnitsOfTransportation} from "../../../shared/types/types";
import {meansOfTransportations} from "../../../shared/constants/constants";
import "./TransportationParams.css";
import walkIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bikeIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import InputWithIcon from "./InputWithIcon";
import distanceIcon from "../assets/icons/icons-16-x-16-outline-ic-distance.svg";

export interface TransportationParamsProps {
    values: TransportationParam[];
    onChange: (newValue: TransportationParam[]) => void;
}

export const transportationParamIcons = [
    {
        type: MeansOfTransportation.WALK,
        icon: walkIcon
    },
    {
        type: MeansOfTransportation.BICYCLE,
        icon: bikeIcon
    },
    {
        type: MeansOfTransportation.CAR,
        icon: carIcon
    }
]

export const defaultTransportationParams = [
    {
        type: MeansOfTransportation.WALK,
        amount: 5,
        unit: UnitsOfTransportation.MINUTES,
    },
    {
        type: MeansOfTransportation.BICYCLE,
        amount: 15,
        unit: UnitsOfTransportation.MINUTES,
    },
    {
        type: MeansOfTransportation.CAR,
        amount: 30,
        unit: UnitsOfTransportation.MINUTES,
    },
];

const TransportationParams: React.FunctionComponent<TransportationParamsProps> = ({
                                                                                      values = defaultTransportationParams,
                                                                                      onChange = () => {
                                                                                      }
                                                                                  }) => {
    const handleOnChange = (newValue: TransportationParam[]) => {
        onChange(newValue);
    }

    const setMeanValue = (newValue: any, mean: MeansOfTransportation) => {
        const newParams = values.map(value => {
            if (value.type !== mean) {
                return value;
            }
            if (Number.isNaN(newValue)) {
                return {
                    ...value,
                    amount: 1
                }
            }
            return {
                ...value,
                amount: parseInt(newValue)
            }
        });
        handleOnChange(newParams);
    }

    const setMeanUnit = (newValue: string, mean: MeansOfTransportation) => {
        const newParams = values.map(value => {
            if (value.type !== mean) {
                return value;
            }
            return {
                ...value,
                unit: Object.values(UnitsOfTransportation).find(uot => uot === newValue) ?? UnitsOfTransportation.METERS
            }
        });
        handleOnChange(newParams);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            {meansOfTransportations.map((mean) => {
                const isActive = values.some(v => v.type === mean.type);
                const currentValue = values.find(v => v.type === mean.type);
                return (
                    <div className="mean-of-transportation" key={`transportation-mean-${mean.type}`}>
                        <div className="flex gap-4 justify-between">
                            <div className="flex gap-6 items-center">
                                <img src={transportationParamIcons.find(list => list.type === mean.type)?.icon}
                                     alt="mean-icon"/>
                                <span className="mean-label">{mean.label}</span>
                            </div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={isActive}
                                    onChange={(e) => {
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
                        {isActive && <div className="distance-unit flex gap-4 flex-wrap">
                            <InputWithIcon
                                icon={distanceIcon}
                                label="Erreichbar in" type="number"
                                value={currentValue?.amount ?? 1}
                                min={1}
                                max={10000}
                                onChange={(event) => setMeanValue(event.target.value, mean.type)}
                                className="input input-bordered flex"
                                placeholder={currentValue?.unit === UnitsOfTransportation.MINUTES ? 'Minuten' : 'Meter'}/>
                            <div className="form-control min-flex">
                                <label className="label">
                                <span>Einheit</span>
                            </label>
                            <select className="select select-bordered flex" value={currentValue?.unit} onChange={(event) => setMeanUnit(event.target.value, mean.type)}>
                                <option value={UnitsOfTransportation.METERS}>Meter</option>
                                <option value={UnitsOfTransportation.MINUTES}>Minuten</option>
                            </select>
                            </div>
                        </div>}
                    </div>
                )
            })
            }
        </div>
    )
}
export default TransportationParams;

import React, {FunctionComponent, useState} from "react";
import {MeansOfTransportation, TransportationParam, UnitsOfTransportation} from "../../../shared/types/types";
import {meansOfTransportations, unitsOfTransportation} from "../../../shared/constants/constants";

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

export interface TransportationParamsProps {
    defaults?: TransportationParam[];
    onChange?: (value: TransportationParam[]) => void;
}

const TransportationParams: FunctionComponent<TransportationParamsProps> = ({
                                                                                defaults = defaultTransportationParams,
                                                                                onChange = () => {
                                                                                }
                                                                            }) => {
    const [transportation, setTransportation] = useState<TransportationParam[]>([...defaults]);

    const handleOnChange = (newValue: TransportationParam[]) => {
        setTransportation([...newValue]);
        onChange(newValue);
    }

    return (
        <>
            {meansOfTransportations.map((t) => {
                const active = transportation.some((tr) => tr.type === t.type);
                return (
                    <div className="flex-col gap-6 my-5" key={t.type}>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-xs checkbox-primary"
                                checked={active}
                                onChange={(e) => {
                                    if (!active) {
                                        handleOnChange([
                                            ...transportation,
                                            {
                                                type: t.type,
                                                amount: 5,
                                                unit: UnitsOfTransportation.MINUTES,
                                            },
                                        ]);
                                    } else {
                                        handleOnChange([
                                            ...transportation.filter((tr) => tr.type !== t.type),
                                        ]);
                                    }
                                }}
                            />
                            <span className="ml-2">{t.label}</span>
                        </label>
                        {active &&
                        <div className="flex">
                            <div>
                                <label className="label">
                                    <span>
                                      {" "}
                                        {transportation.some(
                                            (tr) =>
                                                tr.type === t.type &&
                                                tr.unit === UnitsOfTransportation.MINUTES
                                        )
                                            ? "Erreichbar in"
                                            : "Im Umkreis von"}{" "}
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    value={
                                        transportation.find((tr) => tr.type === t.type)?.amount || ""
                                    }
                                    onChange={(event) => {
                                        handleOnChange(
                                            transportation.map((tr) =>
                                                tr.type === t.type
                                                    ? {
                                                        ...tr,
                                                        amount:
                                                            transportation.find((tr) => tr.type === t.type)
                                                                ?.unit === UnitsOfTransportation.MINUTES
                                                                ? parseInt(event.target.value) > 60
                                                                    ? 60
                                                                    : parseInt(event.target.value)
                                                                : parseInt(event.target.value),
                                                    }
                                                    : tr
                                            )
                                        );
                                    }
                                    }
                                    className="input input-bordered"
                                    placeholder={
                                        transportation.some(
                                            (tr) =>
                                                tr.type === t.type &&
                                                tr.unit === UnitsOfTransportation.MINUTES
                                        )
                                            ? "Minuten"
                                            : "Metern"
                                    }
                                />
                            </div>
                            <label
                                htmlFor={"toggle-" + t.label}
                                className="flex items-end mb-2.5 ml-5 cursor-pointer"
                            >
                                <div className="mr-3 text-gray-700 font-medium">
                                    {
                                        unitsOfTransportation.find(
                                            (uot) => uot.type === UnitsOfTransportation.METERS
                                        )?.label
                                    }
                                </div>
                                <div className="relative mb-1">
                                    <input
                                        id={"toggle-" + t.label}
                                        type="checkbox"
                                        className="sr-only"
                                        checked={transportation.some(
                                            (tr) =>
                                                tr.type === t.type &&
                                                tr.unit === UnitsOfTransportation.MINUTES
                                        )}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                handleOnChange(
                                                    transportation.map((tr) =>
                                                        tr.type === t.type
                                                            ? {
                                                                ...tr,
                                                                unit: UnitsOfTransportation.MINUTES,
                                                            }
                                                            : tr
                                                    )
                                                );
                                            } else {
                                                handleOnChange(
                                                    transportation.map((tr) =>
                                                        tr.type === t.type
                                                            ? {
                                                                ...tr,
                                                                unit: UnitsOfTransportation.METERS,
                                                            }
                                                            : tr
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                    <div className="w-10 h-4 bg-gray-200 rounded-full shadow-inner"/>
                                    <div
                                        className="dot absolute w-6 h-6 bg-white rounded-full shadow border -left-1 -top-1 transition"/>
                                </div>
                                <div className="ml-3 text-gray-700 font-medium">
                                    {
                                        unitsOfTransportation.find(
                                            (uot) => uot.type === UnitsOfTransportation.MINUTES
                                        )?.label
                                    }
                                </div>
                            </label>
                        </div>
                        }
                    </div>
                );
            })}
        </>);
}

export default TransportationParams;

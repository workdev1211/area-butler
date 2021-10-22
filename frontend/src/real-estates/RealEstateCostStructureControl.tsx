import React from "react";
import {allRealEstateCostTypes} from "../../../shared/constants/real-estate";
import {ApiRealEstateCost, ApiRealEstateCostType} from "../../../shared/types/real-estate";

const defaultValue: () => ApiRealEstateCost = () => ({
    price: {
        amount: 0,
        currency: "€"
    },
    type: ApiRealEstateCostType.RENT_MONTHLY_COLD
});

export interface RealEstateCostStructureControlProps {
    inputValues?: ApiRealEstateCost;
    onChange: (realEstateCost: ApiRealEstateCost) => void;
}

const RealEstateCostStructureControl: React.FunctionComponent<RealEstateCostStructureControlProps> =
    ({onChange, inputValues = defaultValue()}) => {
        const setAmount = (value?: number) => {
            const newCostStructure: ApiRealEstateCost = {
                ...inputValues,
                price: {
                    currency: '€',
                    amount: value
                }
            };
            onChange({...newCostStructure});
        }

        const setCostType = (value: ApiRealEstateCostType) => {
            const newCostStructure = {
                ...inputValues,
                type: value
            };
            onChange({...newCostStructure});
        }

        return (
            <div className="flex flex-wrap items-end gap-6">
                <div className="form-control flex-1">
                    <label className="label">
                        <span className="label-text">Preis (€)</span>
                    </label>
                    <input
                        className="input input-bordered"
                        value={inputValues?.price.amount}
                        onChange={(event) => setAmount(!!event.target.value ? +event.target.value : undefined)}
                        name="costAmount"
                        type="number"
                        placeholder="Preis eingeben"
                    />
                </div>
                <div className="form-control flex-1">
                    <label className="label">
                        <span className="label-text">Kostenart</span>
                    </label>
                    <select
                        name="energyEfficiency"
                        placeholder="Kostenart eingeben"
                        className="select select-bordered w-full max-w-xs"
                        value={inputValues?.type}
                        onChange={(event) => setCostType(event.target.value as ApiRealEstateCostType)}
                    >
                        {allRealEstateCostTypes.map((arct) => (
                            <option value={arct.type} key={arct.type}>{arct.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    };

export default RealEstateCostStructureControl;

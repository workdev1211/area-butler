import { FunctionComponent, useState } from "react";
import { allRealEstateCostTypes } from "../../../shared/constants/real-estate";
import {
    ApiRealEstateCost,
    ApiRealEstateCostType
} from "../../../shared/types/real-estate";

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

export const RealEstateCostStructureControl: FunctionComponent<RealEstateCostStructureControlProps> =
  ({ onChange, inputValues = null }) => {
    const [costStructure, setCostStructure] =
      useState<ApiRealEstateCost>(inputValues || defaultValue());

    const setAmount = (value: number) => {
      const newCostStructure = {...costStructure};
      newCostStructure.price.amount = value;
      setCostStructure(newCostStructure);
      onChange({...newCostStructure});
    }

    const setCostType = (value: ApiRealEstateCostType) => {
        const newCostStructure = {...costStructure};
        newCostStructure.type = value;
        setCostStructure(newCostStructure);
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
              value={costStructure.price.amount}
              onChange={(event) => setAmount(+event.target.value)}
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
            value={costStructure.type}
            onChange={(event) => setCostType(event.target.value as ApiRealEstateCostType)}
          >
            {allRealEstateCostTypes.map((arct) => (
              <option value={arct.type}>{arct.label}</option>
            ))}
          </select>
          </div>
        </div>
    );
  };

export default RealEstateCostStructureControl;

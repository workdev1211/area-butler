import { FunctionComponent, useState } from "react";

import { allRealEstateCostTypes } from "../../../shared/constants/real-estate";
import {
  ApiRealEstateCost,
  ApiRealEstateCostType,
} from "../../../shared/types/real-estate";

export interface RealEstateCostStructureControlProps {
  inputValues?: ApiRealEstateCost;
  onChange: (realEstateCost: ApiRealEstateCost) => void;
}

const RealEstateCostStructureControl: FunctionComponent<
  RealEstateCostStructureControlProps
> = ({
  onChange,
  inputValues = {
    type: ApiRealEstateCostType.RENT_MONTHLY_COLD,
  } as ApiRealEstateCost,
}) => {
  const [isNeededMinPrice, setIsNeededMinPrice] = useState(
    !!inputValues?.minPrice
  );

  const setAmount = (type: "minPrice" | "price", value: number | string) => {
    const newCostStructure: ApiRealEstateCost = { ...inputValues };
    newCostStructure[type] = Number.isFinite(value)
      ? {
          amount: +value,
          currency: "€",
        }
      : undefined;

    onChange(newCostStructure);
  };

  const setCostType = (value: ApiRealEstateCostType) => {
    const newCostStructure = {
      ...inputValues,
      type: value,
    };

    onChange(newCostStructure);
  };

  return (
    <div className="flex flex-wrap items-end justify-start gap-6">
      <div className="form-control mr-5 mb-2">
        <label className="cursor-pointer label justify-start pl-0">
          <input
            className="checkbox checkbox-primary checkbox-sm"
            type="checkbox"
            value={+isNeededMinPrice}
            onChange={({ target: { checked } }) => {
              setIsNeededMinPrice(checked);

              if (!checked) {
                setAmount("minPrice", "");
              }
            }}
            name="costAmount"
            placeholder="Preis eingeben"
          />
          <span className="label-text ml-2">Ab</span>
        </label>
      </div>
      {isNeededMinPrice && (
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text">Mindestpreis (€)</span>
          </label>
          <input
            className="input input-bordered"
            value={inputValues?.minPrice?.amount || ""}
            onChange={(event) => {
              setAmount(
                "minPrice",
                event.target.value ? +event.target.value : ""
              );
            }}
            name="costAmount"
            type="number"
            placeholder="Preis eingeben"
          />
        </div>
      )}
      <div className="form-control flex-1">
        <label className="label">
          <span className="label-text">{`${
            isNeededMinPrice ? "Höchstpreis" : "Preis"
          } (€)`}</span>
        </label>
        <input
          className="input input-bordered"
          value={inputValues?.price?.amount || ""}
          onChange={(event) => {
            setAmount(
              "price",
              event.target.value ? +event.target.value : ""
            );
          }}
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
          onChange={(event) => {
            setCostType(event.target.value as ApiRealEstateCostType);
          }}
        >
          {allRealEstateCostTypes.map((t) => (
            <option value={t.type} key={t.type}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RealEstateCostStructureControl;

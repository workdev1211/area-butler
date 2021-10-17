import { FunctionComponent, useState } from "react";
import { allFurnishing } from "../../../shared/constants/real-estate";
import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics
} from "../../../shared/types/real-estate";

const defaultValue: () => ApiRealEstateCharacteristics = () => ({
  numberOfRooms: 0,
  realEstateSizeInSquareMeters: 0,
  furnishing: [],
});

export interface RealEstateCharacteristicsControlProps {
  inputValues?: ApiRealEstateCharacteristics;
  onChange: (furnishing: ApiRealEstateCharacteristics) => void;
}

export const RealEstateCharacteristicsControl: FunctionComponent<RealEstateCharacteristicsControlProps> =
  ({ onChange, inputValues = null }) => {
    const [characteristics, setCharacteristics] =
      useState<ApiRealEstateCharacteristics>(inputValues || defaultValue());

    const changeFurnishing = (f: ApiFurnishing) => {
      const furnishing = characteristics.furnishing || [];
      let newFurnishing = [...furnishing];
      if (furnishing.includes(f)) {
        newFurnishing = newFurnishing.filter((fur) => fur !== f);
      } else {
        newFurnishing.push(f);
      }

      characteristics.furnishing = newFurnishing;

      setCharacteristics({ ...characteristics });
      onChange({ ...characteristics });
    };

    const setRealEstateSizeInSquareMeters = (value?: number) => {
      const newCharacteristics = {...characteristics};
      newCharacteristics.realEstateSizeInSquareMeters = value;
      setCharacteristics(newCharacteristics);
      onChange({...newCharacteristics});
    }

    const setPropertySizeInSquareMeters = (value?: number) => {
      const newCharacteristics = {...characteristics};
      newCharacteristics.propertySizeInSquareMeters = value;
      setCharacteristics(newCharacteristics);
      onChange({...newCharacteristics});
    }

    const setEnergyEfficiency = (value: ApiEnergyEfficiency) => {
      const newCharacteristics = {...characteristics};
      newCharacteristics.energyEfficiency = value;
      setCharacteristics(newCharacteristics);
      onChange({...newCharacteristics});
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end gap-6">
          <div className="form-control flex-1">
            <label className="label">
              <span className="label-text">Größe in Quadratmeter</span>
            </label>
            <input
              className="input input-bordered"
              value={characteristics.realEstateSizeInSquareMeters}
              onChange={(event) => setRealEstateSizeInSquareMeters(!!event.target.value ? +event.target.value: undefined)}
              name="realEstateSizeInSquareMeters"
              type="number"
              placeholder="Größe in Quadrameter"
            />
          </div>
          <div className="form-control flex-1">
            <label className="label">
              <span className="label-text">Grundstück in Quadrameter</span>
            </label>
            <input
              className="input input-bordered"
              value={characteristics.propertySizeInSquareMeters}
              onChange={(event) => setPropertySizeInSquareMeters(!!event.target.value ? +event.target.value: undefined)}
              name="propertySizeInSquareMeters"
              type="number"
              placeholder="Grundstück in Quadrameter"
            />
          </div>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Energieeffizienzklasse</span>
          </label>
          <select
            name="energyEfficiency"
            placeholder="Energieeffizienzklasse"
            className="select select-bordered w-full max-w-xs"
            value={characteristics.energyEfficiency}
            onChange={(event) => setEnergyEfficiency(event.target.value as ApiEnergyEfficiency)}
          >
            {Object.keys(ApiEnergyEfficiency).map((aee) => (
              <option value={aee}>{aee}</option>
            ))}
          </select>
        </div>
        <label className="label mt-4">
          <span className="label-text">
            <strong>Ausstattung</strong>
          </span>
        </label>
        {allFurnishing.map((f) => (
          <label className="cursor-pointer label justify-start gap-3">
            <input
              type="checkbox"
              checked={characteristics.furnishing.includes(f.type)}
              className="checkbox checkbox-primary"
              onChange={(e) => changeFurnishing(f.type)}
            />
            <span className="label-text">{f.label}</span>
          </label>
        ))}
      </div>
    );
  };

export default RealEstateCharacteristicsControl;

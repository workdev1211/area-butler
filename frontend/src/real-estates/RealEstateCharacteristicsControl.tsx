import { FC } from "react";

import { allFurnishing } from "../../../shared/constants/real-estate";
import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics,
} from "../../../shared/types/real-estate";

const defaultValue: () => ApiRealEstateCharacteristics =
  (): ApiRealEstateCharacteristics => ({
    numberOfRooms: 0,
    realEstateSizeInSquareMeters: 0,
    furnishing: [],
    startingAt: false,
  });

interface IRealEstCharControlProps {
  inputValues?: ApiRealEstateCharacteristics;
  onChange: (furnishing: ApiRealEstateCharacteristics) => void;
}

// Not used for the moment. Left just in case of possible future usage.

const RealEstateCharacteristicsControl: FC<IRealEstCharControlProps> = ({
  onChange,
  inputValues = defaultValue(),
}) => {
  const changeFurnishing = (newFurn: ApiFurnishing) => {
    const furnishing = inputValues?.furnishing?.includes(newFurn)
      ? inputValues?.furnishing.filter((furn) => furn !== newFurn)
      : [...(inputValues?.furnishing || []), newFurn];

    const newCharacteristics = {
      ...inputValues,
      furnishing,
    };

    onChange({ ...newCharacteristics });
  };

  const setRealEstateSizeInSquareMeters = (value?: number): void => {
    const newCharacteristics = {
      ...inputValues,
      realEstateSizeInSquareMeters: value,
    };

    onChange({ ...newCharacteristics });
  };

  const setPropertySizeInSquareMeters = (value?: number): void => {
    const newCharacteristics = {
      ...inputValues,
      propertySizeInSquareMeters: value,
    };

    onChange({ ...newCharacteristics });
  };

  const setEnergyEfficiency = (value: ApiEnergyEfficiency): void => {
    const newCharacteristics = {
      ...inputValues,
      energyEfficiency: value,
    };

    onChange({ ...newCharacteristics });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-6">
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text">Größe in Quadratmeter</span>
          </label>
          <input
            className="input input-bordered"
            value={inputValues.realEstateSizeInSquareMeters}
            onChange={(event) =>
              setRealEstateSizeInSquareMeters(
                !!event.target.value ? +event.target.value : undefined
              )
            }
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
            value={inputValues.propertySizeInSquareMeters}
            onChange={(event) =>
              setPropertySizeInSquareMeters(
                !!event.target.value ? +event.target.value : undefined
              )
            }
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
          value={inputValues.energyEfficiency}
          onChange={(event) =>
            setEnergyEfficiency(event.target.value as ApiEnergyEfficiency)
          }
        >
          {Object.keys(ApiEnergyEfficiency).map((energyEfficiency) => (
            <option value={energyEfficiency} key={energyEfficiency}>
              {energyEfficiency}
            </option>
          ))}
        </select>
      </div>

      <label className="label mt-4">
        <span className="label-text">
          <strong>Ausstattung</strong>
        </span>
      </label>
      {allFurnishing.map((furn) => (
        <label
          className="cursor-pointer label justify-start gap-3"
          key={furn.label}
        >
          <input
            type="checkbox"
            checked={inputValues.furnishing?.includes(furn.type)}
            className="checkbox checkbox-primary"
            onChange={(e) => changeFurnishing(furn.type)}
          />
          <span className="label-text">{furn.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RealEstateCharacteristicsControl;

import { FunctionComponent, useState } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import {
  IApiSnapshotPoiFilter,
  PoiFilterTypesEnum,
} from "../../../../../shared/types/types";
import { toastError } from "../../../shared/shared.functions";

interface IPoiFilterProps {
  poiFilter?: IApiSnapshotPoiFilter;
  onChange: (poiFilter: IApiSnapshotPoiFilter) => void;
}

const PoiFilter: FunctionComponent<IPoiFilterProps> = ({
  poiFilter,
  onChange,
}) => {
  const { t } = useTranslation();
  const [poiFilterType, setPoiFilterType] = useState(
    poiFilter?.type || PoiFilterTypesEnum.NONE
  );
  const [poiDistance, setPoiDistance] = useState<number | string>(
    (poiFilter?.type === PoiFilterTypesEnum.BY_DISTANCE && poiFilter?.value) ||
      ""
  );
  const [poiAmount, setPoiAmount] = useState<number | string>(
    (poiFilter?.type === PoiFilterTypesEnum.BY_AMOUNT && poiFilter?.value) || ""
  );

  return (
    <div
      className="grid auto-rows-fr gap-2"
      style={{ gridTemplateColumns: "auto auto" }}
    >
      <div
        className="flex items-center gap-1 cursor-pointer col-span-2"
        onClick={() => {
          setPoiFilterType(PoiFilterTypesEnum.NONE);
        }}
      >
        <input
          type="radio"
          name="poi-filter-type"
          className="radio radio-primary"
          checked={poiFilterType === PoiFilterTypesEnum.NONE}
          onChange={() => {}}
        />
        <div className="label-text">{t(IntlKeys.snapshotEditor.none)}</div>
      </div>
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => {
          setPoiFilterType(PoiFilterTypesEnum.BY_DISTANCE);
        }}
      >
        <input
          className="radio radio-primary"
          name="poi-filter-type"
          type="radio"
          checked={poiFilterType === PoiFilterTypesEnum.BY_DISTANCE}
          onChange={() => {}}
          style={{ flexShrink: 0 }}
        />
        <div className="label-text">{t(IntlKeys.snapshotEditor.distance)}:</div>
      </div>
      <div className="flex items-center gap-1 label-text">
        <span>{t(IntlKeys.snapshotEditor.showOnly)}</span>
        <input
          className="input input-bordered h-auto px-2"
          name="poi-distance"
          type="text"
          placeholder="XX"
          size={4}
          maxLength={5}
          value={poiDistance}
          disabled={poiFilterType !== PoiFilterTypesEnum.BY_DISTANCE}
          onChange={({ target: { value } }) => {
            if (+value || value === "") {
              setPoiDistance(value);
            }
          }}
        />
        <span>{t(IntlKeys.snapshotEditor.meterRadius)}</span>
      </div>
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => {
          setPoiFilterType(PoiFilterTypesEnum.BY_AMOUNT);
        }}
      >
        <input
          className="radio radio-primary"
          name="poi-filter-type"
          type="radio"
          checked={poiFilterType === PoiFilterTypesEnum.BY_AMOUNT}
          onChange={() => {}}
          style={{ flexShrink: 0 }}
        />
        <div className="label-text">{t(IntlKeys.snapshotEditor.quantity)}:</div>
      </div>
      <div className="flex items-center gap-1 label-text">
        <span>{t(IntlKeys.snapshotEditor.showOnlyTheText)}</span>
        <input
          className="input input-bordered h-auto px-2"
          name="poi-amount"
          type="text"
          placeholder="XX"
          size={4}
          maxLength={5}
          value={poiAmount}
          disabled={poiFilterType !== PoiFilterTypesEnum.BY_AMOUNT}
          onChange={({ target: { value } }) => {
            if (+value || value === "") {
              setPoiAmount(value);
            }
          }}
        />
        <span>{t(IntlKeys.snapshotEditor.POIs)}</span>
      </div>
      <div className="flex col-span-2">
        <button
          className="btn btn-xs btn-primary"
          style={{ padding: "0.25rem", height: "auto" }}
          onClick={() => {
            if (
              poiFilterType !== PoiFilterTypesEnum.NONE &&
              !(
                poiFilterType === PoiFilterTypesEnum.BY_DISTANCE && poiDistance
              ) &&
              !(poiFilterType === PoiFilterTypesEnum.BY_AMOUNT && poiAmount)
            ) {
              toastError(t(IntlKeys.snapshotEditor.enterValidValue));
              return;
            }

            const resultingPoiFilter: IApiSnapshotPoiFilter = {
              type: poiFilterType,
            };

            if (poiFilterType !== PoiFilterTypesEnum.NONE) {
              resultingPoiFilter.value =
                poiFilterType === PoiFilterTypesEnum.BY_DISTANCE
                  ? +poiDistance
                  : +poiAmount;
            }

            onChange(resultingPoiFilter);
          }}
        >
          {t(IntlKeys.common.apply)}
        </button>
      </div>
    </div>
  );
};

export default PoiFilter;

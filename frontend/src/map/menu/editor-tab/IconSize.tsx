import { FunctionComponent, useState } from "react";

import { IApiSnapshotIconSizes } from "../../../../../shared/types/types";
import { defaultAmenityIconSize, defaultMyLocationIconSize } from "../../Map";

interface IIconSizeProps {
  iconSizes?: IApiSnapshotIconSizes;
  onChange: (iconSizes: IApiSnapshotIconSizes) => void;
}

const IconSizes: FunctionComponent<IIconSizeProps> = ({
  iconSizes,
  onChange,
}) => {
  const [mapIconSize, setMapIconSize] = useState<number | "">(
    iconSizes?.mapIconSize || defaultMyLocationIconSize
  );
  const [poiIconSize, setPoiIconSize] = useState<number | "">(
    iconSizes?.poiIconSize || defaultAmenityIconSize
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      <h4 className="font-bold">Symbolgrößen</h4>
      <div
        className="grid auto-rows-fr gap-2"
        style={{ gridTemplateColumns: "2fr 1.5fr" }}
      >
        <input
          className="range"
          type="range"
          min="10"
          max="120"
          value={mapIconSize}
          onChange={({ target: { value } }) => {
            const numericValue = +value;

            if (numericValue || value === "") {
              setMapIconSize(numericValue);
            }

            if (numericValue) {
              onChange({ ...iconSizes, mapIconSize: numericValue });
            }
          }}
        />
        <div className="label-text">Karten Icon Größe</div>
        <input
          className="range"
          type="range"
          min="10"
          max="120"
          value={poiIconSize}
          onChange={({ target: { value } }) => {
            const numericValue = +value;

            if (numericValue || value === "") {
              setPoiIconSize(numericValue);
            }

            if (numericValue) {
              onChange({ ...iconSizes, poiIconSize: numericValue });
            }
          }}
        />
        <div className="label-text">POI Icon Größe</div>
      </div>
    </div>
  );
};

export default IconSizes;

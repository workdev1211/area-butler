import React from "react";
import { SelectedMapClipping } from "./MapClippingSelection";

export interface MapClippingsProps {
  mapClippings: SelectedMapClipping[];
}

export const MapClippings: React.FunctionComponent<MapClippingsProps> = ({
  mapClippings,
}) => {
  const imageSize = {
    width: "500px",
    height: "250px",
  };

  const imagePosition = {
    "object-fit": "cover",
    height: "100%",
    width: "100%",
  };

  return (
    <div className="m-10 flex flex-col gap-6" id="expose-map-clippings">
      {mapClippings
        .filter((clipping) => clipping.selected)
        .map((clipping) => (
          <div>
            <div className="mt-5" style={imageSize}>
              <img
                style={imagePosition}
                src={clipping.mapClippingDataUrl}
                alt="img-clipping"
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default MapClippings;

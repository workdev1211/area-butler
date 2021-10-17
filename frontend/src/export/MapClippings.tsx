import { MapClipping } from "context/SearchContext";
import { FunctionComponent } from "react";

export interface MapClippingsProps {
  mapClippings: MapClipping[];
  showTitles?: boolean;
}

export const birdsEye = 10;
export const city = 14;
export const nearby = 17;

export const MapClippings: FunctionComponent<MapClippingsProps> = ({
  mapClippings,
  showTitles = true,
}) => {
  const birdsEyeClipping = mapClippings.find(
    (clipping) => clipping.zoomLevel === birdsEye
  );
  const cityClipping = mapClippings.find(
    (clipping) => clipping.zoomLevel === city
  );
  const nearbyClipping = mapClippings.find(
    (clipping) => clipping.zoomLevel === nearby
  );

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
      <div>
        {showTitles && <h1>Was erreiche ich in der Nähe?</h1>}
        <div className="mt-5" style={imageSize}>
          <img
            style={imagePosition}
            src={nearbyClipping?.mapClippingDataUrl}
          ></img>
        </div>
      </div>
      <div>
        {showTitles && <h1>Wie sieht es in der größeren Umgebung aus?</h1>}
        <div className="mt-5" style={imageSize}>
          <img
            style={imagePosition}
            src={cityClipping?.mapClippingDataUrl}
          ></img>
        </div>
      </div>
      <div style={imageSize}>
        {showTitles && <h1>Was erreiche ich ansonsten?</h1>}
        <div className="mt-5">
          <img
            style={imagePosition}
            src={birdsEyeClipping?.mapClippingDataUrl}
          ></img>
        </div>
      </div>
    </div>
  );
};

export default MapClippings;

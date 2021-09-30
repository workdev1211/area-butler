import { MapClipping } from "context/SearchContext";
import { FunctionComponent } from "react";

export interface MapClippingsProps {
  mapClippings: MapClipping[];
}

export const birdsEye = 10;
export const city = 14;
export const nearby = 17;


export const MapClippings: FunctionComponent<MapClippingsProps> = ({mapClippings}) => {

  const birdsEyeClipping = mapClippings.find(clipping => clipping.zoomLevel === birdsEye);
  const cityClipping = mapClippings.find(clipping => clipping.zoomLevel === city);
  const nearbyClipping = mapClippings.find(clipping => clipping.zoomLevel === nearby);

  const imageSize = {
    width: '75%',
    height: '75%'
  }

  return (<div className="m-10 flex flex-col gap-6" id="expose-map-clippings">
    <div className="mx-5">
      <h1>Was erreiche ich in der Nähe?</h1>
      <div className="mt-5" style={imageSize}>
        <img src={nearbyClipping?.mapClippingDataUrl}></img>
      </div>
    </div>
    <div className="mx-5">
      <h1>Wie sieht es in der größeren Umgebung aus?</h1>
      <div className="mt-5" style={imageSize}>
        <img src={cityClipping?.mapClippingDataUrl}></img>
      </div>
    </div>
    <div className="mx-5" style={imageSize}>
      <h1>Was erreiche ich ansonsten?</h1>
      <div className="mt-5">
        <img src={birdsEyeClipping?.mapClippingDataUrl}></img>
      </div>
    </div>
  </div>);
};


export default MapClippings;
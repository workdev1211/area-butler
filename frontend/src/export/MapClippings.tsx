import React from "react";
import { SelectedMapClipping } from "./MapClippingSelection";
import { PdfPage } from "./PdfPage";
import AreaButlerLogo from "../assets/img/logo.jpg";

export interface MapClippingsProps {
  mapClippings: SelectedMapClipping[];
  logo?: string;
  nextPageNumber?: () => string;
}

export const MapClippings: React.FunctionComponent<MapClippingsProps> = ({
  mapClippings,
  logo = AreaButlerLogo,
  nextPageNumber = () => "01",
}) => {
  const imageSize = {
    width: "auto",
    height: "400px",
  };

  const imagePosition = {
    "object-fit": "cover",
    height: "100%",
    width: "100%",
  };

  const mapClippingPairs: SelectedMapClipping[][] = mapClippings
    .filter((c) => c.selected)
    .reduce(
      (
        result: SelectedMapClipping[][],
        value,
        index,
        array: SelectedMapClipping[]
      ) => {
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
      },
      []
    );

  return (
    <>
      {mapClippingPairs.map((pairs) => (
        <PdfPage nextPageNumber={nextPageNumber} logo={logo} title="Kartenausschnitte">
          <div className="m-10 flex flex-col gap-12" id="expose-map-clippings">
            {pairs.map((clipping) => (
              <div className="flex-1">
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
        </PdfPage>
      ))}
    </>
  );
};

export default MapClippings;

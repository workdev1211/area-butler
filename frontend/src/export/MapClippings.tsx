import { FunctionComponent } from "react";

import { ISelectableMapClipping } from "./MapClippingSelection";
import { PdfPage } from "./PdfPage";
import { QrCode } from "./QrCode";
import { IQrCodeState } from "./ExportModal";

export interface MapClippingsProps {
  mapClippings: ISelectableMapClipping[];
  logo?: string;
  nextPageNumber?: () => string;
  qrCode: IQrCodeState;
}

export const MapClippings: FunctionComponent<MapClippingsProps> = ({
  mapClippings,
  logo,
  nextPageNumber = () => "01",
  qrCode,
}) => {
  const imageSize = {
    width: "auto",
    height: "400px",
  };

  // TODO change to reduce only
  const mapClippingPairs: ISelectableMapClipping[][] = mapClippings
    .filter((c) => c.selected)
    .reduce(
      (
        result: ISelectableMapClipping[][],
        value,
        index,
        array: ISelectableMapClipping[]
      ) => {
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
      },
      []
    );

  return (
    <>
      {mapClippingPairs.map((pairs, pairIndex) => (
        <PdfPage
          nextPageNumber={nextPageNumber}
          logo={logo}
          title="Kartenausschnitte"
          key={pairIndex}
          leftHeaderElement={
            qrCode.isShownQrCode && (
              <QrCode snapshotToken={qrCode.snapshotToken} />
            )
          }
        >
          <div className="m-10 flex flex-col gap-12" id="expose-map-clippings">
            {pairs.map((clipping, clippingIndex) => (
              <div className="flex-1" key={clippingIndex}>
                <div className="mt-5" style={imageSize}>
                  <img
                    style={{
                      objectFit: "cover",
                      height: "100%",
                      width: "100%",
                    }}
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

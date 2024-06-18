import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { ISelectableMapClipping } from "./MapClippingSelection";
import { PdfPage } from "./PdfPage";
import { QrCode } from "./QrCode";
import { IQrCodeState } from "../../../shared/types/export";

interface IMapClippingsProps {
  mapClippings: ISelectableMapClipping[];
  logo?: string;
  nextPageNumber?: () => string;
  qrCode: IQrCodeState;
}

export const MapClippings: FunctionComponent<IMapClippingsProps> = ({
  mapClippings,
  logo,
  nextPageNumber = () => "01",
  qrCode,
}) => {
  const { t } = useTranslation();
  const mapClippingPairs: ISelectableMapClipping[][] = mapClippings
    .filter((c) => c.isSelected)
    .reduce(
      (
        result: ISelectableMapClipping[][],
        value,
        index,
        array: ISelectableMapClipping[]
      ) => {
        if (index % 2 === 0) {
          result.push(array.slice(index, index + 2));
        }

        return result;
      },
      []
    );

  return (
    <>
      {mapClippingPairs.map((pair, pairIndex) => (
        <PdfPage
          nextPageNumber={nextPageNumber}
          logo={logo}
          title={t(IntlKeys.snapshotEditor.exportTab.mapSection)}
          key={pairIndex}
          leftHeaderElement={
            qrCode.isShownQrCode && (
              <QrCode snapshotToken={qrCode.snapshotToken} />
            )
          }
        >
          <div id="expose-map-clippings" className="m-10 flex flex-col gap-10">
            {pair.map((clipping, clippingIndex) => (
              <img
                key={clippingIndex}
                style={{ objectFit: "cover", width: "auto", height: "400px" }}
                src={clipping.mapClippingDataUrl}
                alt="img-clipping"
              />
            ))}
          </div>
        </PdfPage>
      ))}
    </>
  );
};

export default MapClippings;

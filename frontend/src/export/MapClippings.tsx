import { FC } from "react";
import { useTranslation } from "react-i18next";

import { ISelectableMapClipping } from "./MapClippingSelection";
import { PdfPage } from "./PdfPage";
import { QrCode } from "./QrCode";
import { IQrCodeState } from "../../../shared/types/export";
import { IntlKeys } from "i18n/keys";
import { LanguageTypeEnum } from "../../../shared/types/types";

interface IMapClippingsProps {
  mapClippings: ISelectableMapClipping[];
  logo?: string;
  nextPageNumber?: () => string;
  qrCode: IQrCodeState;
  outputLanguage?: LanguageTypeEnum;
}

export const MapClippings: FC<IMapClippingsProps> = ({
  mapClippings,
  logo,
  nextPageNumber = () => "01",
  qrCode,
  outputLanguage,
}) => {
  const { t } = useTranslation("", { lng: outputLanguage });

  const mapClippingPairs: ISelectableMapClipping[][] = mapClippings.reduce(
    (
      result: ISelectableMapClipping[][],
      value,
      index,
      array: ISelectableMapClipping[]
    ) => {
      if (!value.isSelected) {
        return result;
      }

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
          title={t(IntlKeys.snapshotEditor.dataTab.mapSection)}
          key={pairIndex}
          leftHeaderElement={
            qrCode.isShownQrCode && <QrCode outputLanguage={outputLanguage} />
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

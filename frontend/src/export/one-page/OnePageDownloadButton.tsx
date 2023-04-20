import { FunctionComponent, useRef } from "react";
import ReactToPrint from "react-to-print";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { ApiSearchResultSnapshotConfig } from "../../../../shared/types/types";
import OnePage from "./OnePage";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import { ILegendItem } from "../Legend";
import { IQrCodeState } from "../ExportModal";

interface IOnePageDownloadProps {
  addressDescription: string;
  groupedEntries: any;
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  downloadButtonDisabled: boolean;
  onAfterPrint: () => void;
  color: string;
  logo: string;
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  qrCode: IQrCodeState;
  snapshotConfig: ApiSearchResultSnapshotConfig;
  isTrial: boolean;
}

export const OnePageDownload: FunctionComponent<IOnePageDownloadProps> = ({
  addressDescription,
  groupedEntries,
  listingAddress,
  realEstateListing,
  downloadButtonDisabled,
  color,
  logo,
  onAfterPrint,
  legend,
  mapClippings,
  qrCode,
  snapshotConfig,
  isTrial,
}) => {
  const componentRef = useRef(null);

  let documentTitle = "MeinStandort_AreaButler";

  if (realEstateListing?.name) {
    documentTitle = `${realEstateListing.name.replace(/\s/g, "")}_AreaButler`;
  }

  if (listingAddress) {
    documentTitle = `${
      listingAddress.replace(/\s/g, "").split(",")[0]
    }_AreaButler`;
  }

  return (
    <>
      <ReactToPrint
        documentTitle={documentTitle}
        onAfterPrint={onAfterPrint}
        trigger={() => (
          <button
            className="btn btn-primary btn-sm indicator"
            disabled={downloadButtonDisabled}
          >
            {!downloadButtonDisabled && (
              <div
                className="indicator-item badge w-5 h-5 text-white"
                style={{ backgroundColor: "#7155d3" }}
              >
                <div
                  className="tooltip tooltip-left tooltip-accent text-justify font-bold text-white"
                  data-tip="Bitte benutzen Sie den Google Chrome Browser. Andere Browser werden das pdf nicht korrekt generieren."
                >
                  i
                </div>
              </div>
            )}
            <div>Exportieren</div>
          </button>
        )}
        content={() => componentRef.current!}
        bodyClass="font-serif"
      />

      <OnePage
        ref={componentRef}
        addressDescription={addressDescription}
        groupedEntries={groupedEntries}
        listingAddress={listingAddress}
        realEstateListing={realEstateListing}
        color={color}
        logo={logo}
        legend={legend}
        mapClippings={mapClippings}
        qrCode={qrCode}
        snapshotConfig={snapshotConfig}
        isTrial={isTrial}
      />
    </>
  );
};

export default OnePageDownload;

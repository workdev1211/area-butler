import { FunctionComponent, useRef } from "react";
import ReactToPrint from "react-to-print";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { ApiUser } from "../../../../shared/types/types";
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
  user: ApiUser | null;
  color?: string;
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  qrCode: IQrCodeState;
}

export const OnePageDownload: FunctionComponent<IOnePageDownloadProps> = ({
  addressDescription,
  groupedEntries,
  listingAddress,
  realEstateListing,
  downloadButtonDisabled,
  user,
  onAfterPrint,
  color,
  legend,
  mapClippings,
  qrCode,
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
    <div>
      <ReactToPrint
        documentTitle={documentTitle}
        onAfterPrint={onAfterPrint}
        trigger={() => (
          <button
            className="btn btn-primary btn-sm"
            disabled={downloadButtonDisabled}
          >
            Exportieren
          </button>
        )}
        content={() => componentRef.current!}
        bodyClass="font-serif"
      />

      <OnePage
        addressDescription={addressDescription}
        ref={componentRef}
        groupedEntries={groupedEntries}
        listingAddress={listingAddress}
        realEstateListing={realEstateListing}
        user={user}
        color={color}
        legend={legend}
        mapClippings={mapClippings}
        qrCode={qrCode}
      />
    </div>
  );
};

export default OnePageDownload;

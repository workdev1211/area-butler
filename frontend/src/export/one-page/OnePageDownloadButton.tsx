import { FunctionComponent, useRef } from "react";
import ReactToPrint from "react-to-print";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiSearchResultSnapshotConfig,
  ApiUser,
} from "../../../../shared/types/types";
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
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  qrCode: IQrCodeState;
  snapshotConfig: ApiSearchResultSnapshotConfig;
}

export const OnePageDownload: FunctionComponent<IOnePageDownloadProps> = ({
  addressDescription,
  groupedEntries,
  listingAddress,
  realEstateListing,
  downloadButtonDisabled,
  user,
  onAfterPrint,
  legend,
  mapClippings,
  qrCode,
  snapshotConfig,
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
        legend={legend}
        mapClippings={mapClippings}
        qrCode={qrCode}
        snapshotConfig={snapshotConfig}
      />
    </div>
  );
};

export default OnePageDownload;

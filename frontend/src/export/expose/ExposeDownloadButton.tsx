import { FunctionComponent, useRef, useState } from "react";
import ReactToPrint from "react-to-print";

import { ISelectableMapClipping } from "export/MapClippingSelection";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
  TransportationParam,
} from "../../../../shared/types/types";
import Expose from "./Expose";
import { ResultEntity } from "../../components/SearchResultContainer";
import { ILegendItem } from "../Legend";
import { IQrCodeState } from "../ExportModal";

export interface ExposeDownloadProps {
  entities: ResultEntity[];
  groupedEntries: any;
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  downloadButtonDisabled: boolean;
  mapClippings: ISelectableMapClipping[];
  censusData: ApiGeojsonFeature[];
  particlePollutionData?: ApiGeojsonFeature[];
  federalElectionData?: FederalElectionDistrict;
  user: ApiUser | null;
  onAfterPrint: () => void;
  color?: string;
  legend: ILegendItem[];
  qrCode: IQrCodeState;
}

export const ExposeDownload: FunctionComponent<ExposeDownloadProps> = ({
  groupedEntries = [],
  transportationParams = [],
  activeMeans,
  listingAddress,
  realEstateListing,
  entities = [],
  downloadButtonDisabled,
  mapClippings = [],
  censusData = [],
  federalElectionData,
  particlePollutionData,
  user,
  onAfterPrint,
  color,
  legend,
  qrCode,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [activePrinting, setActivePrinting] = useState(false);

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
        onBeforeGetContent={async () => {
          setActivePrinting(true);
        }}
        onAfterPrint={async () => {
          setActivePrinting(false);
          onAfterPrint();
        }}
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
      <Expose
        groupedEntries={groupedEntries}
        ref={componentRef}
        transportationParams={transportationParams}
        activeMeans={activeMeans}
        listingAddress={listingAddress}
        realEstateListing={realEstateListing}
        mapClippings={mapClippings}
        censusData={censusData}
        federalElectionData={federalElectionData}
        particlePollutionData={particlePollutionData}
        activePrinting={activePrinting}
        user={user}
        color={color}
        legend={legend}
        qrCode={qrCode}
      />
    </div>
  );
};

export default ExposeDownload;

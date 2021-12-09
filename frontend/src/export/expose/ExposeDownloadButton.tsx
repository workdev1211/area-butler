import { SelectedMapClipping } from "export/MapClippingSelection";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import React, { useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
  TransportationParam
} from "../../../../shared/types/types";
import Expose from "./Expose";
import { ResultEntity } from "../../components/SearchResultContainer";

export interface ExposeDownloadProps {
  entities: ResultEntity[];
  groupedEntries: any;
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  downloadButtonDisabled: boolean;
  mapClippings: SelectedMapClipping[];
  censusData: ApiGeojsonFeature[];
  particlePollutionData?: ApiGeojsonFeature[];
  federalElectionData?: FederalElectionDistrict;
  user: ApiUser | null;
  onAfterPrint: () => void;
}

export class ComponentToPrint extends React.PureComponent {
  render() {
    return <div>Test</div>;
  }
}

export const ExposeDownload: React.FunctionComponent<ExposeDownloadProps> = ({
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
  onAfterPrint
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [activePrinting, setActivePrinting] = useState(false);

  let documentTitle = "MeinStandort_AreaButler";

  if (!!realEstateListing?.name) {
    documentTitle = `${realEstateListing.name.replace(/\s/g, "")}_AreaButler`;
  }

  if (!!listingAddress) {
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
        federalElectionData={federalElectionData!}
        particlePollutionData={particlePollutionData!}
        activePrinting={activePrinting}
        user={user}
      />
    </div>
  );
};

export default ExposeDownload;

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
import { TCensusData } from "../../hooks/censusdata";
import { useTools } from "../../hooks/tools";

export interface ExposeDownloadProps {
  entities: ResultEntity[];
  groupedEntries: any;
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  downloadButtonDisabled: boolean;
  mapClippings: ISelectableMapClipping[];
  censusData?: TCensusData;
  particlePollutionData?: ApiGeojsonFeature[];
  federalElectionData?: FederalElectionDistrict;
  onAfterPrint: () => void;
  color: string;
  logo: string;
  isTrial: boolean;
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
  censusData,
  federalElectionData,
  particlePollutionData,
  onAfterPrint,
  color,
  logo,
  isTrial,
  legend,
  qrCode,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [activePrinting, setActivePrinting] = useState(false);

  const { getActualUser } = useTools();
  const user = getActualUser();
  const isIntegrationUser = "accessToken" in user;

  let documentTitle = "MeinStandort_AreaButler";

  if (realEstateListing?.name) {
    documentTitle = `${realEstateListing.name.replace(/\s/g, "")}_AreaButler`;
  }

  if (listingAddress) {
    documentTitle = `${
      listingAddress.replace(/\s/g, "").split(",")[0]
    }_AreaButler`;
  }

  let fontFamily = "archia";
  let exposeStyle: string;

  if (!isIntegrationUser && user?.exportFonts?.length) {
    const exportFont = user.exportFonts[0];
    fontFamily = exportFont.fontFamily;

    exposeStyle = `#expose-pdf { font-family: ${fontFamily}; } ${exportFont.fontFaces.join(
      " ,"
    )}`;
  } else {
    exposeStyle = `#expose-pdf { font-family: ${fontFamily}; }`;
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
        color={color}
        logo={logo}
        isTrial={isTrial}
        legend={legend}
        qrCode={qrCode}
        style={exposeStyle}
      />
    </div>
  );
};

export default ExposeDownload;

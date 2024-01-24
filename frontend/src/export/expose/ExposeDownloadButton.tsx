import { FunctionComponent, useRef, useState } from "react";
import ReactToPrint from "react-to-print";

import { ISelectableMapClipping } from "export/MapClippingSelection";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  MeansOfTransportation,
  TransportationParam,
} from "../../../../shared/types/types";
import Expose from "./Expose";
import { ILegendItem } from "../Legend";
import { useTools } from "../../hooks/tools";
import { IQrCodeState } from "../../../../shared/types/export";
import { TCensusData } from "../../../../shared/types/data-provision";

interface IExposeDownloadProps {
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

export const ExposeDownload: FunctionComponent<IExposeDownloadProps> = ({
  groupedEntries = [],
  transportationParams = [],
  activeMeans,
  listingAddress,
  realEstateListing,
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
  const isIntegrationUser = "integrationUserId" in user;

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

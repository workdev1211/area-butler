import { FunctionComponent, useRef, useState } from "react";
import ReactToPrint from "react-to-print";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiSearchResponse,
  TransportationParam,
} from "../../../../shared/types/types";
import Cheatsheet from "./Cheatsheet";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import { ResultEntity } from "../../shared/search-result.types";
import { ILegendItem } from "../Legend";
import { useTools } from "../../hooks/tools";
import { IQrCodeState } from "../../../../shared/types/export";
import { TCensusData } from "../../../../shared/types/data-provision";

interface ICheatsheetDownloadProps {
  entities: ResultEntity[];
  searchResponse: ApiSearchResponse;
  groupedEntries: any;
  transportationParams: TransportationParam[];
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

export const CheatsheetDownload: FunctionComponent<
  ICheatsheetDownloadProps
> = ({
  groupedEntries,
  transportationParams,
  listingAddress,
  realEstateListing,
  entities,
  searchResponse,
  downloadButtonDisabled,
  mapClippings,
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
  const componentRef = useRef();
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

  // TODO move to a shared function component inside the export dir
  let fontFamily = "archia";
  let cheatSheetStyle: string;

  if (!isIntegrationUser && user?.exportFonts?.length) {
    const exportFont = user.exportFonts[0];
    fontFamily = exportFont.fontFamily;

    cheatSheetStyle = `#cheatsheet-pdf { font-family: ${fontFamily}; } ${exportFont.fontFaces.join(
      " ,"
    )}`;
  } else {
    cheatSheetStyle = `#cheatsheet-pdf { font-family: ${fontFamily}; }`;
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
      <Cheatsheet
        searchResponse={searchResponse}
        entities={entities}
        activePrinting={activePrinting}
        ref={componentRef}
        groupedEntries={groupedEntries}
        transportationParams={transportationParams}
        listingAddress={listingAddress}
        realEstateListing={realEstateListing}
        mapClippings={mapClippings}
        censusData={censusData}
        federalElectionData={federalElectionData!}
        particlePollutionData={particlePollutionData!}
        color={color}
        logo={logo}
        isTrial={isTrial}
        legend={legend}
        qrCode={qrCode}
        style={cheatSheetStyle}
      />
    </div>
  );
};

export default CheatsheetDownload;

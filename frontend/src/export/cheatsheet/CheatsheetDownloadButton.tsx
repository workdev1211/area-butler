import { FC, useRef, useState } from "react";
import ReactToPrint from "react-to-print";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiSearchResponse,
  LanguageTypeEnum,
  TransportationParam,
} from "../../../../shared/types/types";
import Cheatsheet from "./Cheatsheet";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import { ILegendItem } from "../Legend";
import { IQrCodeState } from "../../../../shared/types/export";
import { TCensusData } from "../../../../shared/types/data-provision";
import { useUserState } from "../../hooks/userstate";

interface ICheatsheetDownloadProps {
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
  outputLanguage?: LanguageTypeEnum;
}

export const CheatsheetDownload: FC<ICheatsheetDownloadProps> = ({
  groupedEntries,
  transportationParams,
  listingAddress,
  realEstateListing,
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
  outputLanguage = LanguageTypeEnum.de,
}) => {
  const { t } = useTranslation();
  const componentRef = useRef();
  const [activePrinting, setActivePrinting] = useState(false);

  const { getActualUser } = useUserState();
  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;

  let documentTitle = `${t(
    IntlKeys.snapshotEditor.dataTab.myLocation
  )}_AreaButler`;

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

  if (!isIntegrationUser && user.config.exportFonts?.length) {
    const exportFont = user.config.exportFonts[0];
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
            {t(IntlKeys.common.export)}
          </button>
        )}
        content={() => componentRef.current!}
        bodyClass="font-serif"
      />

      <Cheatsheet
        searchResponse={searchResponse}
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
        outputLanguage={outputLanguage}
      />
    </div>
  );
};

export default CheatsheetDownload;

import {MapClipping} from "context/SearchContext";
import React, {useRef, useState} from "react";
import ReactToPrint from "react-to-print";
import {ApiRealEstateListing} from "../../../../shared/types/real-estate";
import {ApiGeojsonFeature, ApiSearchResponse, ApiUser, TransportationParam} from "../../../../shared/types/types";
import Cheatsheet from "./Cheatsheet";
import {ResultEntity} from "../../pages/SearchResultPage";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { SelectedMapClipping } from "export/MapClippingSelection";

export interface CheatsheetDownloadProps {
    entities: ResultEntity[];
    searchResponse: ApiSearchResponse;
    groupedEntries: any;
    transportationParams: TransportationParam[];
    listingAddress: string;
    realEstateListing: ApiRealEstateListing;
    downloadButtonDisabled: boolean;
    mapClippings: SelectedMapClipping[];
    censusData: ApiGeojsonFeature[];
    particlePollutionData: ApiGeojsonFeature[];
    federalElectionData: FederalElectionDistrict;
    onAfterPrint: () => void;
    user: ApiUser | null;
}

export const CheatsheetDownload: React.FunctionComponent<CheatsheetDownloadProps> =
    ({
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
         user,
         onAfterPrint
     }) => {
        const componentRef = useRef();

        const [activePrinting, setActivePrinting] = useState(false);

        let documentTitle = 'MeinStandort_AreaButler';

        if (!!realEstateListing?.name) {
            documentTitle = `${realEstateListing.name.replace(/\s/g, "")}_AreaButler`;
        }

        if (!!listingAddress) {
            documentTitle = `${listingAddress.replace(/\s/g, "").split(",")[0]}_AreaButler`;
        }

        return (
            <div>
                <ReactToPrint
                    documentTitle={documentTitle}
                    onBeforeGetContent={async () => {
                        setActivePrinting(true);
                    }}
                    onAfterPrint={async () => {setActivePrinting(false); onAfterPrint();}}
                    trigger={() => (
                        <button className="btn btn-primary btn-sm" disabled={downloadButtonDisabled}>
                            Exportieren
                        </button>
                    )}
                    content={() => componentRef.current!}
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
                    federalElectionData={federalElectionData}
                    particlePollutionData={particlePollutionData}
                    user={user}
                />
            </div>
        );
    };

export default CheatsheetDownload;

import {MapClipping} from "context/SearchContext";
import React, {useRef, useState} from "react";
import ReactToPrint from "react-to-print";
import {ApiRealEstateListing} from "../../../../shared/types/real-estate";
import {ApiGeojsonFeature, ApiSearchResponse, TransportationParam} from "../../../../shared/types/types";
import Cheatsheet from "./Cheatsheet";
import {ResultEntity} from "../../pages/SearchResultPage";

export interface CheatsheetDownloadProps {
    entities: ResultEntity[];
    searchResponse: ApiSearchResponse;
    groupedEntries: any;
    transportationParams: TransportationParam[];
    listingAddress: string;
    realEstateListing: ApiRealEstateListing;
    downloadButtonDisabled: boolean;
    mapClippings: MapClipping[];
    censusData: ApiGeojsonFeature[];
    onAfterPrint: () => void;
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
         censusData
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
                    onAfterPrint={async () => setActivePrinting(false)}
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
                />
            </div>
        );
    };

export default CheatsheetDownload;

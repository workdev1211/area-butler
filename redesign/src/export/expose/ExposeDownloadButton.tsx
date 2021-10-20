import {MapClipping} from "context/SearchContext";
import React, {useRef, useState} from "react";
import ReactToPrint from "react-to-print";
import {ApiRealEstateListing} from "../../../../shared/types/real-estate";
import {ApiGeojsonFeature, ApiSearchResponse, TransportationParam} from "../../../../shared/types/types";
import Expose from "./Expose";
import {ResultEntity} from "../../pages/SearchResultPage";

export interface ExposeDownloadProps {
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

export class ComponentToPrint extends React.PureComponent {
    render() {
        return (
            <div>Test</div>
        );
    }
}

export const ExposeDownload: React.FunctionComponent<ExposeDownloadProps> =
    ({
         groupedEntries = [],
         transportationParams= [],
         listingAddress,
         realEstateListing,
         entities= [],
         searchResponse,
         downloadButtonDisabled,
         mapClippings= [],
         censusData= [],
         onAfterPrint
     }) => {
        const componentRef = useRef<HTMLDivElement>(null);
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
                    onBeforeGetContent={async () => {setActivePrinting(true)}}
                    onAfterPrint={async () => {console.log("onafterprint"); setActivePrinting(false); onAfterPrint();}}
                    trigger={() => (
                        <button className="btn btn-primary btn-sm" disabled={downloadButtonDisabled} >
                            Exportieren
                        </button>
                    )}
                    content={() => componentRef.current!}
                />
                <Expose
                    searchResponse={searchResponse}
                    entities={entities}
                    groupedEntries={groupedEntries}
                    ref={componentRef}
                    transportationParams={transportationParams}
                    listingAddress={listingAddress}
                    realEstateListing={realEstateListing}
                    mapClippings={mapClippings}
                    censusData={censusData}
                    activePrinting={activePrinting}
                />
            </div>
        );
    };

export default ExposeDownload;

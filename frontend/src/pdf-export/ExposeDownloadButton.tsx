import React, { useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { ApiSearchResponse, TransportationParam } from "../../../shared/types/types";
import Expose from "./Expose";
import html2canvas from 'html2canvas';
import { ResultEntity } from "search/SearchResult";
import { MapClipping } from "context/SearchContext";

export interface ExposeDownloadButtonProps {
  entities: ResultEntity[];
  searchResponse: ApiSearchResponse;
  groupedEntries: any;
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  downloadButtonDisabled: boolean;
  mapClippings: MapClipping[];
  onAfterPrint: () => void;
}

export const ExposeDownloadButton: React.FunctionComponent<ExposeDownloadButtonProps> =
  ({
    groupedEntries,
    transportationParams,
    listingAddress,
    realEstateListing,
    entities,
    searchResponse,
    downloadButtonDisabled,
    mapClippings
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
          onBeforeGetContent={async () => {setActivePrinting(true);}}
          onAfterPrint={async () => setActivePrinting(false)}
          trigger={() => (
            <button className="btn btn-sm" disabled={downloadButtonDisabled}>
              Exportieren
            </button>
          )}
          content={() => componentRef.current!}
        />
        <Expose
          searchResponse={searchResponse}
          entities={entities}
          activePrinting={activePrinting}
          ref={componentRef}
          groupedEntries={groupedEntries}
          transportationParams={transportationParams}
          listingAddress={listingAddress}
          realEstateListing={realEstateListing}
          mapClippings={mapClippings}
        />
      </div>
    );
  };

export default ExposeDownloadButton;

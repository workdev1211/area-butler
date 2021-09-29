import React, { useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { ApiSearchResponse, TransportationParam } from "../../../shared/types/types";
import Expose from "./Expose";
import html2canvas from 'html2canvas';
import { ResultEntity } from "search/SearchResult";

export interface ExposeDownloadButtonProps {
  entities: ResultEntity[];
  searchResponse: ApiSearchResponse;
  groupedEntries: any;
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
}

export const ExposeDownloadButton: React.FunctionComponent<ExposeDownloadButtonProps> =
  ({
    groupedEntries,
    transportationParams,
    listingAddress,
    realEstateListing,
    entities,
    searchResponse
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

    const createMapClipping = async (zoom: number) => {
      const canvas = await html2canvas(document.querySelector("#mymap")!, {
        allowTaint: true,
        useCORS: true,
      });
      document.querySelector('#mymap')!.appendChild(canvas);
    };
    
    return (
      <div>
        <ReactToPrint
          documentTitle={documentTitle}
          onBeforeGetContent={async () => {setActivePrinting(true); await createMapClipping(12);}}
          onAfterPrint={async () => setActivePrinting(false)}
          trigger={() => (
            <button className="btn btn-sm">
              Umgebungsanalyse exportieren
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
        />
      </div>
    );
  };

export default ExposeDownloadButton;

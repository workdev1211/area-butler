import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { TransportationParam } from "../../../shared/types/types";
import Expose from "./Expose";

export interface ExposeDownloadButtonProps {
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
  }) => {
    const componentRef = useRef();

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
          trigger={() => (
            <button className="btn btn-sm" onClick={() => {}}>
              Umgebungsanalyse exportieren
            </button>
          )}
          content={() => componentRef.current!}
        />
        <Expose
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

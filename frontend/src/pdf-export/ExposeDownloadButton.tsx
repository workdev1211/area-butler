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

export const ExposeDownloadButton: React.FunctionComponent<ExposeDownloadButtonProps> = ({
  groupedEntries,
  transportationParams,
  listingAddress,
  realEstateListing
}) => {
  const componentRef = useRef();
  return (
    <div>
      <ReactToPrint
        documentTitle="Expose Kudiba"
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

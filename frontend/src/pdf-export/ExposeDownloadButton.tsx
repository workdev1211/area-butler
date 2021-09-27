import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import { TransportationParam } from "../../../shared/types/types";
import Expose from "./Expose";

export interface ExposeDownloadButtonProps {
  groupedEntries: any;
  transportationParams: TransportationParam[];
  listingAddress: string;
}

export const Example: React.FunctionComponent<ExposeDownloadButtonProps> = ({
  groupedEntries,
  transportationParams,
  listingAddress
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
      />
    </div>
  );
};

export default Example;

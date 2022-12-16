import { FunctionComponent } from "react";

import { TLocationIndexData } from "../../../hooks/locationindexdata";
import { LocationIndicesEnum } from "../../../../../shared/types/location-index";

interface ILocationIndexTableProps {
  locationIndexData?: TLocationIndexData;
}

const LocationIndexTable: FunctionComponent<ILocationIndexTableProps> = ({
  locationIndexData,
}) => {
  if (!locationIndexData || !Object.keys(locationIndexData).length) {
    return (
      <div className="flex justify-center items-center p-3 gap-3">
        <div
          className="animate-spin w-7 h-7 border-[3px] border-current border-t-transparent text-gray-800 rounded-full dark:text-white"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Wird geladen...</span>
        </div>
        <div className="text-lg not-sr-only">Wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-[14px]">
      {Object.keys(locationIndexData).map((indexKey) => (
        <div
          className="flex justify-between py-1.5 pr-[5px]"
          style={{
            borderBottom: "0.125rem solid darkgray",
          }}
          key={indexKey}
        >
          <div className="pl-[10px] text-lg font-bold">
            {locationIndexData[indexKey as LocationIndicesEnum].name}
          </div>
          <div
            className="text-lg text-white font-bold px-2"
            style={{
              borderRadius: "15%",
              backgroundColor:
                locationIndexData[indexKey as LocationIndicesEnum].color,
            }}
          >
            {locationIndexData[indexKey as LocationIndicesEnum].value} %
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationIndexTable;

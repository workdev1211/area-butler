import { FunctionComponent } from "react";

import {
  LocationIndicesEnum,
  TLocationIndexData,
} from "../../../../../../../shared/types/location-index";
import Loading from "../../../components/Loading";

interface ILocationIndexTableProps {
  locationIndexData?: TLocationIndexData;
}

const LocationIndexTable: FunctionComponent<ILocationIndexTableProps> = ({
  locationIndexData,
}) => {
  if (!locationIndexData) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col w-full px-[14px]">
      {Object.keys(locationIndexData).map((indexKey) => {
        const locationIndexValueStyle = {
          borderRadius: "15%",
          ...locationIndexData[indexKey as LocationIndicesEnum].colorStyle,
        };

        return (
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
              style={locationIndexValueStyle}
            >
              {locationIndexData[indexKey as LocationIndicesEnum].value} %
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LocationIndexTable;

import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { Loading } from "../../../../components/Loading";
import {
  LocIndexPropsEnum,
  TLocationIndexData,
} from "../../../../../../shared/types/location-index";

interface ILocationIndexTableProps {
  locationIndexData?: TLocationIndexData;
}

const LocationIndexTable: FunctionComponent<ILocationIndexTableProps> = ({
  locationIndexData,
}) => {
  const { t } = useTranslation();
  if (!locationIndexData) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col w-full px-[14px]">
      {Object.keys(locationIndexData).map((indexKey) => {
        const locIndexValueStyle = {
          borderRadius: "15%",
          ...locationIndexData[indexKey as LocIndexPropsEnum].colorStyle,
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
              {t((IntlKeys.snapshotEditor.positionIndices as Record<string, string>)[locationIndexData[indexKey as LocIndexPropsEnum].name])}
            </div>
            <div
              className="text-lg text-white font-bold px-2"
              style={locIndexValueStyle}
            >
              {locationIndexData[indexKey as LocIndexPropsEnum].value} %
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LocationIndexTable;

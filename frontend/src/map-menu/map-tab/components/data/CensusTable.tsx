import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { ApiDataProvisionEnum } from "../../../../../../shared/types/types";
import { Loading } from "../../../../components/Loading";
import { TCensusData } from "../../../../../../shared/types/data-provision";
import { processCensusData } from "../../../../../../shared/functions/census.functions";

interface ICensusTableProps {
  censusData?: TCensusData;
}

const CensusTable: FunctionComponent<ICensusTableProps> = ({ censusData }) => {
  const { t } = useTranslation();
  if (
    !censusData ||
    !Object.keys(censusData).some(
      (provisionKey) => censusData[provisionKey as ApiDataProvisionEnum].length
    )
  ) {
    return <Loading />;
  }

  const processedCensusData = processCensusData(censusData);

  return (
    <table className="table w-full text-sm lg:text-base">
      <tbody>
        {Object.values(processedCensusData).map((censusValue) => (
          <tr
            style={{ borderBottom: "0.125rem solid darkgray" }}
            key={censusValue.label}
          >
            <th>{censusValue.label}</th>
            <td>
              <span className="font-bold italic">{t(IntlKeys.common.address)}</span>
              <br />
              <span className="font-bold italic">PLZ</span>
              <br />
              <span className="italic">DE</span>
            </td>
            <td>
              <span className="font-bold italic">
                {censusValue.value[ApiDataProvisionEnum.ADDRESS_DATA] || "-"}
              </span>
              <br />
              <span className="font-bold italic">
                {censusValue.value[ApiDataProvisionEnum.ZIP_LEVEL_DATA] || "-"}
              </span>
              <br />
              <span className="italic">
                {censusValue.value[ApiDataProvisionEnum.AVERAGE_DATA] || "-"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CensusTable;

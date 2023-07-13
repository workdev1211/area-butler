import { FunctionComponent } from "react";

import { TCensusData } from "../../../../../hooks/censusdata";
import { ApiDataProvisionEnum } from "../../../../../../../shared/types/types";
import Loading from "../../../components/Loading";

export const averageCensus = {
  "Ø Alter": 44.6,
  "Anteil, Ausländer": 11.2,
  Einwohner: 233.0,
  "Ø Pers. pro HH": 2.0,
  "Anteil, Leerstand": 2.8,
  "Ø m² pro Kopf": 45.3,
  "Ø m² pro Whng.": 91.7,
  "Anteil, Bev. ab 65": 21.1,
  "Anteil, Bev. unter 18": 16.3,
} as any;

interface ICensusTableProps {
  censusData?: TCensusData;
}

const CensusTable: FunctionComponent<ICensusTableProps> = ({ censusData }) => {
  if (
    !censusData ||
    !Object.keys(censusData).some(
      (provisionKey) => censusData[provisionKey as ApiDataProvisionEnum].length
    )
  ) {
    return <Loading />;
  }

  const processCensusValue = (value: unknown): string =>
    !Number.isNaN(Number(value))
      ? (Math.round(Number(value) * 10) / 10).toFixed(1)
      : "-";

  const processedCensusData = Object.values<ApiDataProvisionEnum>(
    ApiDataProvisionEnum
  ).reduce<
    Record<
      string,
      {
        label: string;
        value: Record<ApiDataProvisionEnum, string>;
        unit: string;
      }
    >
  >((result, provisionKey) => {
    if (!censusData[provisionKey]) {
      return result;
    }

    const censusCenter =
      censusData[provisionKey].find((c) =>
        (c.properties as any).some((p: any) => p.value !== "unbekannt")
      ) || (censusData.addressData[0] as any);

    censusCenter.properties.forEach(
      ({
        label,
        value,
        unit,
      }: {
        label: string;
        value: string;
        unit: string;
      }) => {
        const processedValue = processCensusValue(value);

        if (result[label]) {
          result[label].value[provisionKey] = processedValue;
        } else {
          result[label] = {
            label,
            value: {
              [provisionKey]: processedValue,
              averageData: processCensusValue(averageCensus[label]),
            } as Record<ApiDataProvisionEnum, string>,
            unit,
          };
        }
      }
    );

    return result;
  }, {});

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
              <span className="font-bold italic">Adresse</span>
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

import { FunctionComponent } from "react";

import { TCensusData } from "../../../hooks/censusdata";
import { ApiDataProvisionEnum } from "../../../../../shared/types/types";

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
  if (!censusData) {
    return null;
  }

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
        if (result[label]) {
          result[label].value[provisionKey] = value;
        } else {
          result[label] = {
            label,
            value: { [provisionKey]: value } as Record<
              ApiDataProvisionEnum,
              string
            >,
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
          <tr key={censusValue.label}>
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
                {!Number.isNaN(
                  Number(censusValue.value[ApiDataProvisionEnum.ADDRESS_DATA])
                )
                  ? (
                      Math.round(
                        Number(
                          censusValue.value[ApiDataProvisionEnum.ADDRESS_DATA]
                        ) * 10
                      ) / 10
                    ).toFixed(1)
                  : "-"}
              </span>
              <br />
              <span className="font-bold italic">
                {!Number.isNaN(
                  Number(censusValue.value[ApiDataProvisionEnum.ZIP_LEVEL_DATA])
                )
                  ? (
                      Math.round(
                        Number(
                          censusValue.value[ApiDataProvisionEnum.ZIP_LEVEL_DATA]
                        ) * 10
                      ) / 10
                    ).toFixed(1)
                  : "-"}
              </span>
              <br />
              <span className="italic">{averageCensus[censusValue.label].toFixed(1)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CensusTable;

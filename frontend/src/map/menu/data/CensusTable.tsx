import { FunctionComponent } from "react";
import { ApiGeojsonFeature } from "../../../../../shared/types/types";

export interface CensusTableProps {
  censusData: ApiGeojsonFeature[];
}

export const averageCensus = {
  Durchschnittsalter: 44.6,
  "Anteil der Ausländer": 11.2,
  Einwohner: 4041,
  "Durchschnittliche Haushaltsgröße": 2.02,
  "Anteil der leerstehenden Wohnungen": 2.8,
  "Durchschnittliche Wohnfläche je Bewohner": 45.3,
  "Durchschnittliche Wohnfläche je Wohnung": 91.7,
  "Anteil der Bevölkerung ab 65 Jahre": 21.1,
  "Anteil der Bevölkerung unter 18 Jahre": 16.3,
} as any;

const CensusTable: FunctionComponent<CensusTableProps> = ({ censusData }) => {
  if (!censusData) {
    return null;
  }

  const censusCenter =
    censusData.find((c) =>
      (c.properties as any).some((p: any) => p.value !== "unbekannt")
    ) || (censusData[0] as any);

  return (
    <table className="table w-full text-sm lg:text-base">
      <thead>
        <tr>
          <th>Beschreibung (pro km2)</th>
          <th>
            <span>Wert</span>
            <br />
            <span>(Ø DE)</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {censusCenter.properties.map(
          (p: { label: string; value: string; unit: string }) => (
            <tr key={p.label}>
              <th>{p.label}</th>
              <td>
                <span>
                  {p.value} {p.unit}
                </span>
                <br />
                <span>
                  ({averageCensus[p.label]}
                  {!p.unit ? "" : " " + p.unit})
                </span>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};

export default CensusTable;

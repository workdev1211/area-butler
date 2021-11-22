import { FunctionComponent } from "react";
import { ApiGeojsonFeature } from "../../../shared/types/types";

export interface CensusTableProps {
  censusData: ApiGeojsonFeature[];
}

const averageCensus = {
  'Durchschnittsalter': 44,
  'Anteil der Ausländer': 8,
  'Einwohner': 4041,
  'Durchschnittliche Haushaltsgröße': 2,
  'Anteil der leerstehenden Wohnungen': 0,
  'Durchschnittliche Wohnfläche je Bewohner': 37,
  'Durchschnittliche Wohnfläche je Wohnung': 68,
  'Anteil der Bevölkerung ab 65 Jahre': 22,
  'Anteil der Bevölkerung unter 18 Jahre': 15,
} as any;

const CensusTable: FunctionComponent<CensusTableProps> = ({ censusData }) => {
  const censusCenter = censusData[0] as any;

  if (!censusCenter) {
    return null;
  }

  return (
    <table className="table w-full text-sm lg:text-base">
            <thead>
        <tr>
          <th>Name</th>
          <th><span>Wert</span><br/><span>(Ø DE)</span></th>
        </tr>
      </thead>
      <tbody>
        {censusCenter.properties.map(
          (p: { label: string; value: string; unit: string }) => (
            <tr key={p.label}>
              <th>{p.label}</th>
              <td>
                <span>{p.value} {p.unit}</span><br/>
                <span>({averageCensus[p.label]}{!p.unit ? '': ' ' + p.unit})</span>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};

export default CensusTable;

import { FunctionComponent } from "react";
import { ApiGeojsonFeature } from "../../../shared/types/types";

export interface CensusTableProps {
  censusData: ApiGeojsonFeature[];
}

const CensusTable: FunctionComponent<CensusTableProps> = ({ censusData }) => {
  const censusCenter = censusData[0] as any;

  if (!censusCenter) {
    return null;
  }

  return (
    <table className="table w-96 text-sm">
      <tbody>
        {censusCenter.properties.map(
          (p: { label: string; value: string; unit: string }) => (
            <tr key={p.label}>
              <th>{p.label}</th>
              <td>
                {p.value} {p.unit}
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};

export default CensusTable;

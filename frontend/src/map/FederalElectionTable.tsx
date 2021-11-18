import {
  FederalElectionDistrict,
  FederalElectionResult,
} from "hooks/federalelectiondata";
import { FunctionComponent } from "react";

export interface FederalElectionTableProps {
  federalElectionData: FederalElectionDistrict;
}

const FederalElectionTable: FunctionComponent<FederalElectionTableProps> = ({
  federalElectionData,
}) => {

  if (!federalElectionData) {
    return null;
  }

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Partei</th>
          <th><span>Zweitstimme (Prozent)</span><br/><span>(Letzte Wahl)</span></th>
        </tr>
      </thead>
      <tbody>
        {federalElectionData.results.map((p: FederalElectionResult) => (
          <tr key={p.party}>
            <td>{p.party}</td>
            <td>
              <span>{p.percentage} %</span>
              <br />
              <span>({p.lastElectionPercentage} %)</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FederalElectionTable;

import { FunctionComponent } from "react";

import {
  FederalElectionDistrict,
  FederalElectionResult,
} from "hooks/federalelectiondata";

interface IFederalElectionTableProps {
  federalElectionData: FederalElectionDistrict;
}

const FederalElectionTable: FunctionComponent<IFederalElectionTableProps> = ({
  federalElectionData,
}) => {
  if (!federalElectionData || !Object.keys(federalElectionData).length) {
    return null;
  }

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Partei</th>
          <th>
            <span>Zweitstimme (Prozent)</span>
            <br />
            <span>(Letzte Wahl)</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {federalElectionData?.results?.map((p: FederalElectionResult) => (
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

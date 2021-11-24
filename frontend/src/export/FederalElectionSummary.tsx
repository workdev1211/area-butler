import {
  FederalElectionDistrict,
  FederalElectionResult,
} from "hooks/federalelectiondata";
import { FunctionComponent } from "react";
import "./EntityTable.css";

export interface FederalElectionSummaryProps {
  federalElectionDistrict: FederalElectionDistrict;
  primaryColor?: string;
}

const FederalElectionSummary: FunctionComponent<FederalElectionSummaryProps> =
  ({ federalElectionDistrict, primaryColor = "#aa0c54" }) => {
    const tableHeaderStyle = {
      backgroundColor: primaryColor,
    };

    return (
      <div className="p-10">
        {federalElectionDistrict && (
          <table className="entity-table">
            <thead>
              <tr style={tableHeaderStyle}>
                <th>Partei</th>
                <th>Ergebnis Zweitstimme (Prozent)</th>
                <th>Ergebnis bei der letzten Wahl</th>
              </tr>
            </thead>
            <tbody>
              {federalElectionDistrict.results.map(
                (p: FederalElectionResult) => (
                  <tr key={p.party}>
                    <td>{p.party}</td>
                    <td>{p.percentage} %</td>
                    <td>{p.lastElectionPercentage} %</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

export default FederalElectionSummary;

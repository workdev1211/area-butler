import { FunctionComponent } from "react";

import "./EntityTable.scss";
import {
  FederalElectionDistrict,
  FederalElectionResult,
} from "hooks/federalelectiondata";
import { deriveColorPalette } from "shared/shared.functions";


export interface FederalElectionSummaryProps {
  federalElectionDistrict: FederalElectionDistrict;
  primaryColor?: string;
}

const FederalElectionSummary: FunctionComponent<
  FederalElectionSummaryProps
> = ({ federalElectionDistrict, primaryColor = "#aa0c54" }) => {
  if (!federalElectionDistrict.results?.length) {
    return null;
  }

  const colorPalette = deriveColorPalette(primaryColor);

  const tableHeaderStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor,
  };

  return (
    <div className="p-10">
      {federalElectionDistrict && (
        <table className="entity-table">
          <thead style={{ backgroundAttachment: "fixed" }}>
            <tr style={tableHeaderStyle}>
              <th>Partei</th>
              <th>Ergebnis Zweitstimme (Prozent)</th>
              <th>Ergebnis bei der letzten Wahl</th>
            </tr>
          </thead>
          <tbody>
            {federalElectionDistrict.results.map((p: FederalElectionResult) => (
              <tr key={p.party}>
                <td>{p.party}</td>
                <td>{p.percentage} %</td>
                <td>{p.lastElectionPercentage} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FederalElectionSummary;

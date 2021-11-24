import { ApiGeojsonFeature } from "../../../shared/types/types";
import React from "react";
import "./EntityTable.css";
import { averageCensus } from "map/CensusTable";

export interface CensusSummaryProps {
  censusData: ApiGeojsonFeature[];
  primaryColor?: string;
}

export const CensusSummary: React.FunctionComponent<CensusSummaryProps> = ({
  censusData, primaryColor = "#aa0c54"
}) => {
  const censusCenter = censusData.find(c => (c.properties as any).some((p : any) => p.value !== 'unbekannt') ) || censusData[0] as any;

  const tableHeaderStyle = {
    backgroundColor: primaryColor,
  };

  return (
    <div className="p-10">
      {censusCenter && (
        <table className="entity-table">
          <thead>
            <tr style={tableHeaderStyle}>
              <th>Beschreibung</th>
              <th>Wert</th>
              <th>Ø Deutschland</th>
            </tr>
          </thead>
          <tbody>
            {censusCenter.properties.map(
              (p: { label: string; value: string; unit: string }) => (
                <tr key={p.label}>
                  <td>{p.label}</td>
                  <td>
                    {p.value} {p.unit}
                  </td>
                  <td>
                    {averageCensus[p.label]}{!p.unit ? '': ' ' + p.unit}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

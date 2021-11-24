import { PollutionData } from "map/ParticlePollutionTable";
import { ApiGeojsonFeature } from "../../../shared/types/types";
import "./EntityTable.css";

export interface ParticlePollutionSummaryProps {
  particlePollutionData?: ApiGeojsonFeature[];
  primaryColor?: string;
}

const ParticlePollutionSummary: React.FunctionComponent<ParticlePollutionSummaryProps> =
  ({ particlePollutionData, primaryColor = "#aa0c54" }) => {
    const tableHeaderStyle = {
      backgroundColor: primaryColor,
    };

    const properties = particlePollutionData![0].properties as any;

    const pollutionData: PollutionData = {
      mean: properties.MEAN || 0,
      daysAboveThreshold:
        properties["Tage mit Tagesmittelwerten > 50 �g/m�"] || 0,
    };

    return (
      <div className="p-10">
        <table className="entity-table">
          <thead>
            <tr style={tableHeaderStyle}>
              <th>Durchschnittliche Belastung</th>
              <th>Tage über Grenzwert (50 g/m2)</th>
            </tr>
          </thead>
          <tbody>
            <tr key="pollution-table-data-mean">
              <td>{pollutionData.mean} g/m2</td>
              <td>{pollutionData.daysAboveThreshold}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

export default ParticlePollutionSummary;

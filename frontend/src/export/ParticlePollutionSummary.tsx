import { averageParticlePollution, PollutionData } from "map/ParticlePollutionTable";
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
              <th>Beschreibung</th>
              <th>Wert</th>
              <th>Ø Deutschland</th>
            </tr>
          </thead>
          <tbody>
            <tr key="pollution-table-data-mean">
              <td>Durchschnittliche Belastung</td>
              <td>{pollutionData.mean} g/m2</td>
              <td>{averageParticlePollution.mean} g/m2</td>
            </tr>
            <tr key="pollution-table-days-above-threshold">
              <td>Tage über Grenzwert (50 g/m2)</td>
              <td>{pollutionData.daysAboveThreshold}</td>
              <td>{averageParticlePollution.daysAboveThreshold}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

export default ParticlePollutionSummary;

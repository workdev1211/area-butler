import {
  averageParticlePollution,
  PollutionData
} from "map/menu/data/ParticlePollutionTable";
import { deriveColorPalette } from "shared/shared.functions";
import { ApiGeojsonFeature } from "../../../shared/types/types";
import "./EntityTable.css";

export interface ParticlePollutionSummaryProps {
  particlePollutionData?: ApiGeojsonFeature[];
  primaryColor?: string;
}

const ParticlePollutionSummary: React.FunctionComponent<ParticlePollutionSummaryProps> = ({
  particlePollutionData,
  primaryColor = "#aa0c54"
}) => {
  const colorPalette = deriveColorPalette(primaryColor);

  const tableHeaderStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor
  };

  const properties = particlePollutionData![0].properties as any;

  const pollutionData: PollutionData = {
    mean: properties.MEAN || 0,
    daysAboveThreshold: properties["Tage mit Tagesmittelwerten > 50 �g/m�"] || 0
  };

  return (
    <div className="p-10">
      <table className="entity-table">
        <thead style={{ backgroundAttachment: "fixed" }}>
          <tr style={tableHeaderStyle}>
            <th>Beschreibung</th>
            <th>Wert</th>
            <th>Ø Deutschland</th>
          </tr>
        </thead>
        <tbody>
          <tr key="pollution-table-data-mean">
            <td>Durchschnittliche Belastung</td>
            <td>{pollutionData.mean} g/m3</td>
            <td>{averageParticlePollution.mean} g/m3</td>
          </tr>
          <tr key="pollution-table-days-above-threshold">
            <td>Tage über Grenzwert (50 g/m3)</td>
            <td>{pollutionData.daysAboveThreshold}</td>
            <td>{averageParticlePollution.daysAboveThreshold}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ParticlePollutionSummary;

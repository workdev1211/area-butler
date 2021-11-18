import { FunctionComponent } from "react";
import { ApiGeojsonFeature } from "../../../shared/types/types";

export interface ParticlePollutionTableProps {
    particlePollutionData: ApiGeojsonFeature[];
}


interface PollutionData {
    mean: number;
    daysAboveThreshold: number;
}

const ParticlePollutionTable: FunctionComponent<ParticlePollutionTableProps> = ({particlePollutionData}) => {

    if (!particlePollutionData || particlePollutionData.length === 0) {
        return null;
    }

    const properties =  particlePollutionData[0].properties as any;

    const pollutionData : PollutionData = {
        mean:  properties.MEAN || 0,
        daysAboveThreshold: properties['Tage mit Tagesmittelwerten > 50 �g/m�'] || 0,
    }

    return <table className="table w-96 text-sm">
    <tbody>
          <tr key="pollution-table-data-mean">
            <th>Durchschnittliche Belastung</th>
            <td>
                {pollutionData.mean} g/m2
            </td>
          </tr>
          <tr key="pollution-table-data-above-threshold">
            <th>Tage über Grenzwert (50 g/m2)</th>
            <td>
                {pollutionData.daysAboveThreshold}
            </td>
          </tr>
    </tbody>
  </table>
}

export default ParticlePollutionTable;
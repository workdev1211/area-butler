import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import "./EntityTable.scss";

import {
  averageParticlePollution,
  PollutionData,
} from "map-menu/map-tab/components/data/ParticlePollutionTable";
import { deriveColorPalette } from "shared/shared.functions";
import { ApiGeojsonFeature } from "../../../shared/types/types";

interface IPartPollutSumProps {
  particlePollutionData?: ApiGeojsonFeature[];
  primaryColor?: string;
}

const ParticlePollutionSummary: FunctionComponent<IPartPollutSumProps> = ({
  particlePollutionData,
  primaryColor = "#aa0c54",
}) => {
  const { t } = useTranslation();
  const colorPalette = deriveColorPalette(primaryColor);

  const tableHeaderStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor,
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
        <thead style={{ backgroundAttachment: "fixed" }}>
          <tr style={tableHeaderStyle}>
            <th>{t(IntlKeys.common.description)}</th>
            <th>{t(IntlKeys.common.value)}</th>
            <th>{t(IntlKeys.snapshotEditor.exportTab.germany)}</th>
          </tr>
        </thead>
        <tbody>
          <tr key="pollution-table-data-mean">
            <td>{t(IntlKeys.snapshotEditor.environmentInfo.avgLoad)}</td>
            <td>{pollutionData.mean} g/m3</td>
            <td>{averageParticlePollution.mean} g/m3</td>
          </tr>
          <tr key="pollution-table-days-above-threshold">
            <td>{t(IntlKeys.snapshotEditor.environmentInfo.daysAboveLimit)} (50 g/m3)</td>
            <td>{pollutionData.daysAboveThreshold}</td>
            <td>{averageParticlePollution.daysAboveThreshold}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ParticlePollutionSummary;

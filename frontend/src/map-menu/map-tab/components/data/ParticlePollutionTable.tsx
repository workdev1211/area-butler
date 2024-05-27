import { FunctionComponent } from "react";

import { IntlKeys } from 'i18n/keys';
import { useTranslation } from 'react-i18next';

import { ApiGeojsonFeature } from "../../../../../../shared/types/types";
import { Loading } from "../../../../components/Loading";

export interface PollutionData {
  mean: number;
  daysAboveThreshold: number;
}

export const averageParticlePollution: PollutionData = {
  mean: 10.78,
  daysAboveThreshold: 0.14,
};

interface IParticlePollutionTableProps {
  particlePollutionData?: ApiGeojsonFeature[];
}

const ParticlePollutionTable: FunctionComponent<
  IParticlePollutionTableProps
> = ({ particlePollutionData }) => {
  const { t } = useTranslation();
  if (!particlePollutionData?.length) {
    return <Loading />;
  }

  const properties = particlePollutionData[0].properties as any;

  const pollutionData: PollutionData = {
    mean: properties.MEAN || 0,
    daysAboveThreshold:
      properties["Tage mit Tagesmittelwerten > 50 �g/m�"] || 0,
  };

  return (
    <table className="table w-full text-sm lg:text-base">
      <thead>
        <tr>
          <th>{t(IntlKeys.common.name)}</th>
          <th>
            <span>{t(IntlKeys.common.value)}</span>
            <br />
            <span>(Ø DE)</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          style={{ borderBottom: "0.125rem solid darkgray" }}
          key="pollution-table-data-mean"
        >
          <th>{t(IntlKeys.snapshotEditor.environmentInfo.avgLoad)}</th>
          <td>
            {pollutionData.mean} g/m3 <br />({averageParticlePollution.mean}{" "}
            g/m3)
          </td>
        </tr>
        <tr key="pollution-table-data-above-threshold">
          <th>{t(IntlKeys.snapshotEditor.environmentInfo.daysAboveLimit)} (50 g/m3)</th>
          <td>
            {pollutionData.daysAboveThreshold} <br />(
            {averageParticlePollution.daysAboveThreshold})
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default ParticlePollutionTable;

import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

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
  const { t } = useTranslation();
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
              <th>{t(IntlKeys.snapshotEditor.socialDemographics.politicalParty)}</th>
              <th>{t(IntlKeys.snapshotEditor.dataTab.resultSecondVote)}</th>
              <th>{t(IntlKeys.snapshotEditor.dataTab.resultLastElection)}</th>
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

import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./EntityTable.scss";
import { deriveColorPalette } from "shared/shared.functions";
import { TCensusData } from "../../../shared/types/data-provision";
import { averageCensusData } from "../../../shared/constants/data-provision";
import { LanguageTypeEnum } from "../../../shared/types/types";

interface ICensusSummaryProps {
  censusData: TCensusData;
  primaryColor?: string;
  outputLanguage?: LanguageTypeEnum;
}

export const CensusSummary: FunctionComponent<ICensusSummaryProps> = ({
  censusData,
  primaryColor = "#aa0c54",
  outputLanguage,
}) => {
  const { t } = useTranslation("", { lng: outputLanguage });
  const censusCenter =
    censusData.addressData.find((c) =>
      (c.properties as any).some((p: any) => p.value !== "unbekannt")
    ) || (censusData.addressData[0] as any);

  const colorPalette = deriveColorPalette(primaryColor);

  const tableHeaderStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor,
  };

  return (
    <div className="p-10">
      {censusCenter && (
        <table className="entity-table">
          <thead style={{ backgroundAttachment: "fixed" }}>
            <tr style={tableHeaderStyle}>
              <th>{t(IntlKeys.snapshotEditor.dataTab.descriptionPerKm)}</th>
              <th>{t(IntlKeys.common.value)}</th>
              <th>{t(IntlKeys.snapshotEditor.dataTab.germany)}</th>
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
                    {averageCensusData[p.label]}
                    {!p.unit ? "" : ` ${p.unit}`}
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

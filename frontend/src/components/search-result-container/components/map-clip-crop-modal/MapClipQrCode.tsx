import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";
import { LanguageTypeEnum } from "../../../../../../shared/types/types";
import { checkIsDarkColor } from '../../../../shared/shared.functions';

interface IMapClipQrCodeImage {
  qrCodeImage: string;
  color?: string;
  language?: LanguageTypeEnum;
}

export const MapClipQrCode: FunctionComponent<IMapClipQrCodeImage> = ({
  qrCodeImage,
  color = "fff",
  language,
}) => {
  const isDark = checkIsDarkColor(color)
  const { t } = useTranslation("", language && { lng: language });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "fit-content",
        alignItems: "center",
        padding: "0.5rem",
        gap: "0.5rem",
        borderRadius: "5%",
        backgroundColor: color ? `#${color}` : undefined,
      }}
    >
      <img src={qrCodeImage} alt="qr-code" />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: isDark ? "white" : 'black',
          fontSize: "1.3rem",
          lineHeight: "1.5rem",
          fontWeight: "bold",
        }}
      >
        <div>{t(IntlKeys.snapshotEditor.dataTab.scanAndNew)}</div>
        <div>{t(IntlKeys.snapshotEditor.dataTab.discoverResidentialArea)}</div>
      </div>
    </div>
  );
};

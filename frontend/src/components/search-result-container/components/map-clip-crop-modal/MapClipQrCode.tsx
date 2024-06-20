import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

interface IMapClipQrCodeImage {
  qrCodeImage: string;
  color?: string;
}

export const MapClipQrCode: FunctionComponent<IMapClipQrCodeImage> = ({
  qrCodeImage,
  color = "white",
}) => {
  const { t } = useTranslation();
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
          color: "white",
          fontSize: "1.3rem",
          lineHeight: "1.5rem",
          fontWeight: "bold",
        }}
      >
        <div>{t(IntlKeys.snapshotEditor.exportTab.scanAndNew)}</div>
        <div>{t(IntlKeys.snapshotEditor.exportTab.discoverResidentialArea)}</div>
      </div>
    </div>
  );
};

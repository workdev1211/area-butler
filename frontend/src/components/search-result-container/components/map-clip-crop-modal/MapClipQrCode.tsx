import { FunctionComponent } from "react";

interface IMapClipQrCodeImage {
  qrCodeImage: string;
  color?: string;
}

export const MapClipQrCode: FunctionComponent<IMapClipQrCodeImage> = ({
  qrCodeImage,
  color = "white",
}) => {
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
        <div>Scannen und neue</div>
        <div>Wohnlage entdecken</div>
      </div>
    </div>
  );
};

import { FunctionComponent } from "react";

import { ISelectableMapClipping } from "../../../MapClippingSelection";
import downArrowIcon from "../../../../assets/icons/icons-12-x-12-outline-ic-caret.svg";

interface IOnePagePngMapQrCodeProps {
  mapClippings: ISelectableMapClipping[];
  color: string;
  qrCodeImage?: string;
}

const OnePagePngMapQrCode: FunctionComponent<IOnePagePngMapQrCodeProps> = ({
  mapClippings,
  color,
  qrCodeImage,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      }}
    >
      <div
        style={{
          fontSize: "1.5rem",
          lineHeight: "2rem",
          fontWeight: 700,
        }}
      >
        Interaktive Karte
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: mapClippings[0].dimensions!.width,
          height: mapClippings[0].dimensions!.height,
          position: "relative",
          // marginTop: "1.25rem",
        }}
      >
        {/* Main image */}
        <img
          style={{
            width: "100%",
            height: "100%",
          }}
          src={mapClippings[0].mapClippingDataUrl}
          alt="map-clipping-1"
        />

        {/* Inner image */}
        {mapClippings[1] && (
          <img
            style={{
              position: "absolute",
              width: Math.round(mapClippings[1].dimensions!.width * 0.35),
              height: Math.round(mapClippings[1].dimensions!.height * 0.35),
              bottom: "3px",
              left: "3px",
              boxShadow: "0 0 5px #201c1e",
            }}
            src={mapClippings[1].mapClippingDataUrl}
            alt="map-clipping-2"
          />
        )}

        {/* QR code and the text */}
        {qrCodeImage && (
          <>
            <div
              style={{
                display: "flex",
                gap: "0.25rem",
                position: "absolute",
                padding: "0.125rem",
                borderRadius: "0.375rem",
                bottom: "1.5%",
                right: "16%",
                background: color,
                boxShadow: "0 0 5px #201c1e",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "fit-content",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    color: "rgb(255 255 255)",
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                  }}
                >
                  Scannen und neue Wohnlage entdecken
                </div>
                <img
                  src={downArrowIcon}
                  alt="right-arrow"
                  style={{ transform: "rotate(-90deg)" }}
                />
              </div>
            </div>
            <img
              style={{
                position: "absolute",
                objectFit: "cover",
                width: "15%",
                height: "auto",
                bottom: "3px",
                right: "3px",
                boxShadow: "0 0 5px #201c1e",
              }}
              src={qrCodeImage}
              alt="qr-code"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OnePagePngMapQrCode;

import { FunctionComponent } from "react";

import downArrowIcon from "../../../../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import { IOnePageMapQrCodeProps } from "../../../../shared/one-page.types";

const OnePageMapQrCode: FunctionComponent<IOnePageMapQrCodeProps> = ({
  mapClippings,
  color,
  qrCodeImage,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-2xl font-bold">Interaktive Karte</div>

      <div className="relative" style={{ width: "auto", height: "400px" }}>
        {/* Main image */}
        <img
          style={{
            objectFit: "cover",
            height: "100%",
            width: "100%",
          }}
          src={mapClippings[0].mapClippingDataUrl}
          alt="map-clipping-1"
        />

        {/* Inner image */}
        {mapClippings[1] && (
          <img
            className="absolute"
            style={{
              objectFit: "cover",
              width: "35%",
              height: "auto",
              bottom: "3px",
              left: "3px",
              boxShadow: "0 0 5px var(--base-anthracite)",
            }}
            src={mapClippings[1].mapClippingDataUrl}
            alt="map-clipping-2"
          />
        )}

        {/* QR code and the text */}
        {qrCodeImage && (
          <>
            <div
              className="flex items-center gap-1 absolute p-0.5 rounded-md"
              style={{
                bottom: "1.5%",
                right: "16%",
                background: color,
                boxShadow: "0 0 5px var(--base-anthracite)",
              }}
            >
              <div className="flex w-fit items-center">
                <div className="text-white text-xs px-0.5">
                  Scan and discover new residential areas
                </div>
                <img
                  src={downArrowIcon}
                  alt="right-arrow"
                  style={{ transform: "rotate(-90deg)" }}
                />
              </div>
            </div>

            <img
              className="absolute"
              style={{
                objectFit: "cover",
                width: "15%",
                height: "auto",
                bottom: "3px",
                right: "3px",
                boxShadow: "0 0 5px var(--base-anthracite)",
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

export default OnePageMapQrCode;

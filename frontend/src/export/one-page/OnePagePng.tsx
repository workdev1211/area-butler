import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { IOnePagePngProps } from "../../shared/one-page.types";
import areaButlerLogo from "../../assets/img/logo.svg";
import OnePagePngLogoAddress from "./components/png/OnePagePngLogoAddress";
import OnePagePngPoiList from "./components/png/OnePagePngPoiList";
import OnePagePngMapQrCode from "./components/png/OnePagePngMapQrCode";

export const OnePagePng: FunctionComponent<IOnePagePngProps> = ({
  addressDescription,
  entityGroups,
  listingAddress,
  realEstateListing,
  color,
  logo,
  mapClippings,
  isTransparentBackground,
  style,
  snapshotConfig,
  isTrial,
  qrCodeImage,
}) => {
  const { t } = useTranslation();
  return (
    <div
      id="one-page-png"
      style={{
        overflow: "visible",
        width: "100%",
        height: "100%",
        display: "block",
        // minWidth: "21cm",
        minWidth: "827px",
        maxWidth: "827px",
        // minHeight: "29.6cm",
        minHeight: "1169px",
        maxHeight: "1169px",
        padding: "2.5rem",
        // fontFamily: "archia",
        backgroundColor: isTransparentBackground ? "transparent" : "white",
      }}
    >
      <style>{style}</style>

      {isTrial && (
        <img
          src={areaButlerLogo}
          alt="watermark"
          style={{
            width: "100%",
            height: "100%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            zIndex: 100,
            position: "fixed",
            top: "50%",
            left: "50%",
            opacity: "0.4",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <OnePagePngLogoAddress
          logo={logo}
          snapshotConfig={snapshotConfig}
          realEstateListing={realEstateListing}
          listingAddress={listingAddress}
        />

        {/* Description */}
        {addressDescription && (
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
              {t(IntlKeys.snapshotEditor.dataTab.locationDescription)}
            </div>
            <div style={{ textAlign: "justify", maxWidth: "747px" }}>
              {addressDescription}
            </div>
          </div>
        )}

        <OnePagePngPoiList entityGroups={entityGroups} />

        {mapClippings.length > 0 && (
          <OnePagePngMapQrCode
            mapClippings={mapClippings}
            color={color}
            qrCodeImage={qrCodeImage}
          />
        )}
      </div>
    </div>
  );
};

export default OnePagePng;

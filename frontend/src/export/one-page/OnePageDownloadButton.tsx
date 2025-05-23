import { FC, useRef } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import ReactToPrint from "react-to-print";

import OnePage from "./OnePage";
import { IOnePagePdfDownProps } from "../../shared/one-page.types";

export const OnePageDownload: FC<IOnePagePdfDownProps> = ({
  addressDescription,
  entityGroups,
  listingAddress,
  realEstateListing,
  color,
  logo,
  onAfterPrint,
  legend,
  mapClippings,
  snapshotConfig,
  isTrial,
  isExportBtnDisabled,
  qrCodeImage,
}) => {
  const { t } = useTranslation();
  const componentRef = useRef(null);

  let documentTitle = `${t(
    IntlKeys.snapshotEditor.dataTab.myLocation
  )}_AreaButler`;

  if (realEstateListing?.name) {
    documentTitle = `${realEstateListing.name.replace(/\s/g, "")}_AreaButler`;
  }

  if (listingAddress) {
    documentTitle = `${
      listingAddress.replace(/\s/g, "").split(",")[0]
    }_AreaButler`;
  }

  return (
    <>
      <ReactToPrint
        documentTitle={documentTitle}
        onAfterPrint={onAfterPrint}
        trigger={() => (
          <button
            className="btn btn-primary btn-sm indicator"
            disabled={isExportBtnDisabled}
          >
            {!isExportBtnDisabled && (
              <div
                className="indicator-item badge w-5 h-5 text-white"
                style={{ backgroundColor: "#7155d3" }}
              >
                <div
                  className="tooltip tooltip-left tooltip-accent text-justify font-bold text-white"
                  data-tip={t(IntlKeys.snapshotEditor.dataTab.useChrome)}
                >
                  i
                </div>
              </div>
            )}
            <div>{t(IntlKeys.common.export)}</div>
          </button>
        )}
        content={() => componentRef.current!}
        bodyClass="font-serif"
      />

      <OnePage
        ref={componentRef}
        addressDescription={addressDescription}
        entityGroups={entityGroups}
        listingAddress={listingAddress}
        realEstateListing={realEstateListing}
        color={color}
        logo={logo}
        legend={legend}
        mapClippings={mapClippings}
        qrCodeImage={qrCodeImage}
        snapshotConfig={snapshotConfig}
        isTrial={isTrial}
      />
    </>
  );
};

export default OnePageDownload;

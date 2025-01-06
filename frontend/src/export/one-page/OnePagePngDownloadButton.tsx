import { FC, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { renderToStaticMarkup } from "react-dom/server";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";

import { ISelectableMapClipping } from "export/MapClippingSelection";
import OnePagePng from "./OnePagePng";
import { ConfigContext } from "../../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";
import { useIntegrationTools } from "../../hooks/integration/integrationtools";
import { IOnePagePngDownProps } from "../../shared/one-page.types";
import { integrationNames } from "../../../../shared/constants/integration";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/types";

export const OnePagePngDownload: FC<IOnePagePngDownProps> = ({
  addressDescription,
  entityGroups,
  listingAddress,
  realEstateListing,
  color,
  logo,
  mapClippings,
  isTransparentBackground,
  snapshotConfig,
  isTrial,
  isExportBtnDisabled,
  qrCodeImage,
  exportFonts,
}) => {
  const { t } = useTranslation();
  const { integrationType } = useContext(ConfigContext);

  const { sendToIntegration } = useIntegrationTools();

  const [selectedMapClippings, setSelectedMapClippings] = useState<
    ISelectableMapClipping[]
  >([]);

  useEffect(() => {
    if (!mapClippings.length) {
      setSelectedMapClippings([]);
      return;
    }

    const processMapClippings = async () => {
      const processedMapClippings = await Promise.all(
        mapClippings.map(
          async (mapClipping): Promise<ISelectableMapClipping> => {
            const image = new Image();
            image.src = mapClipping.mapClippingDataUrl;
            await image.decode();

            // the new approach uses the 16:9 image with the width of 747px and the height of 420.2px
            const maxWidth = 747;
            // const maxHeight = 350;
            const sourceWidth = image.width;
            const sourceHeight = image.height;
            const widthRatio = sourceWidth / maxWidth;
            // const heightRatio = sourceHeight / maxHeight;
            // let resultingWidth = sourceWidth;
            // let resultingHeight = sourceHeight;

            // if (widthRatio > heightRatio || widthRatio === heightRatio) {
            //   resultingWidth = maxWidth;
            //   resultingHeight = Math.round(sourceHeight / widthRatio);
            // }
            //
            // if (heightRatio > widthRatio) {
            //   resultingWidth = Math.round(sourceWidth / heightRatio);
            //   resultingHeight = maxHeight;
            // }

            return {
              ...mapClipping,
              dimensions: {
                width: maxWidth,
                height: sourceHeight / widthRatio,
              },
            };
          }
        )
      );

      setSelectedMapClippings(processedMapClippings);
    };

    void processMapClippings();
  }, [mapClippings]);

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

  let fontFamily = "archia";
  let onePagePngStyle: string;

  if (exportFonts?.length) {
    const exportFont = exportFonts[0];
    fontFamily = exportFont.fontFamily;

    onePagePngStyle = `#one-page-png { font-family: ${fontFamily}; } ${exportFont.fontFaces.join(
      " ,"
    )}`;
  } else {
    onePagePngStyle = `#one-page-png { font-family: ${fontFamily}; }`;
  }

  const getRenderedPngImage = async (): Promise<string> => {
    const renderedOnePagePng = renderToStaticMarkup(
      <OnePagePng
        addressDescription={addressDescription}
        entityGroups={entityGroups}
        listingAddress={listingAddress}
        realEstateListing={realEstateListing}
        color={color}
        logo={logo}
        mapClippings={selectedMapClippings}
        qrCodeImage={qrCodeImage}
        snapshotConfig={snapshotConfig}
        isTrial={isTrial}
        isTransparentBackground={isTransparentBackground}
        style={onePagePngStyle}
      />
    );

    const onePagePngElement = document.createElement("div");
    onePagePngElement.innerHTML = renderedOnePagePng;

    const pngImage = await toPng(onePagePngElement, {
      pixelRatio: 6,
      width: 827, // 2480 / 3
      height: 1169, // 3508 / 3
    });

    onePagePngElement.remove();

    return pngImage;
  };

  return (
    <>
      {integrationType &&
        [
          IntegrationTypesEnum.ON_OFFICE,
          IntegrationTypesEnum.PROPSTACK,
        ].includes(integrationType) && (
          <button
            className="btn btn-primary btn-sm"
            disabled={isExportBtnDisabled}
            onClick={async () => {
              void sendToIntegration({
                base64Image: await getRenderedPngImage(),
                exportType: AreaButlerExportTypesEnum.ONE_PAGE_PNG,
                filename: `${documentTitle}.png`,
                fileTitle: documentTitle,
              });
            }}
          >
            {t(IntlKeys.snapshotEditor.dataTab.sendTo, {
              integrationType: integrationNames[integrationType],
            })}
          </button>
        )}

      <button
        className="btn btn-primary btn-sm"
        disabled={isExportBtnDisabled}
        onClick={async () => {
          saveAs(await getRenderedPngImage(), `${documentTitle}.png`);
        }}
      >
        {t(IntlKeys.common.export)}
      </button>
    </>
  );
};

export default OnePagePngDownload;

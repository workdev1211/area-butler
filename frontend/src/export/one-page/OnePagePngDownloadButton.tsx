import { FunctionComponent, useContext, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiSearchResultSnapshotConfig,
  IApiUserExportFont,
} from "../../../../shared/types/types";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import { ILegendItem } from "../Legend";
import { IQrCodeState } from "../ExportModal";
import OnePagePng from "./OnePagePng";
import { getQrCodeBase64 } from "../QrCode";
import {
  createDirectLink,
  preferredLocationsTitle,
} from "../../shared/shared.functions";
import { IPoiIcon } from "../../shared/shared.types";
import { ConfigContext } from "../../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";
import { useIntegrationTools } from "../../hooks/integrationtools";
import { ApiOnOfficeArtTypesEnum } from "../../../../shared/types/on-office";
import { ISortableEntityGroup } from "./OnePageExportModal";

interface IOnePageDownloadProps {
  addressDescription: string;
  entityGroups: ISortableEntityGroup[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  downloadButtonDisabled: boolean;
  color: string;
  logo: string;
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  qrCode: IQrCodeState;
  isTransparentBackground: boolean;
  snapshotConfig: ApiSearchResultSnapshotConfig;
  isTrial: boolean;
  exportFonts?: IApiUserExportFont[];
}

export const OnePagePngDownload: FunctionComponent<IOnePageDownloadProps> = ({
  addressDescription,
  entityGroups,
  listingAddress,
  realEstateListing,
  downloadButtonDisabled,
  color,
  logo,
  legend,
  mapClippings,
  qrCode,
  isTransparentBackground,
  snapshotConfig,
  isTrial,
  exportFonts,
}) => {
  const { integrationType } = useContext(ConfigContext);

  const { sendToOnOffice } = useIntegrationTools();

  const [qrCodeImage, setQrCodeImage] = useState<string>();
  const [selectedMapClippings, setSelectedMapClippings] = useState<
    ISelectableMapClipping[]
  >([]);

  useEffect(() => {
    if (!mapClippings.length) {
      setSelectedMapClippings([]);
      return;
    }

    const selected = mapClippings.reduce<ISelectableMapClipping[]>(
      (result, mapClipping) => {
        if (mapClipping.selected) {
          result.push(mapClipping);
        }

        return result;
      },
      []
    );

    setSelectedMapClippings(selected);
  }, [mapClippings]);

  useEffect(() => {
    if (!qrCode.isShownQrCode || !qrCode.snapshotToken) {
      setQrCodeImage(undefined);
      return;
    }

    const createQrCode = async () => {
      setQrCodeImage(
        await getQrCodeBase64(createDirectLink(qrCode.snapshotToken!))
      );
    };

    void createQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode.isShownQrCode]);

  const filteredGroups = entityGroups.reduce<
    (ISortableEntityGroup & { icon?: IPoiIcon })[]
  >((result, group) => {
    if (
      group.title !== preferredLocationsTitle &&
      group.active &&
      group.items.length > 0
    ) {
      const groupIcon = legend.find(({ title }) => title === group.title)?.icon;
      const items = [...group.items].slice(0, 3);
      result.push({ ...group, items, icon: groupIcon });
    }

    return result;
  }, []);

  let documentTitle = "MeinStandort_AreaButler";

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
        entityGroups={filteredGroups}
        listingAddress={listingAddress}
        realEstateListing={realEstateListing}
        color={color}
        logo={logo}
        legend={legend}
        mapClippings={selectedMapClippings}
        qrCodeImage={qrCodeImage}
        isTransparentBackground={isTransparentBackground}
        style={onePagePngStyle}
        snapshotConfig={snapshotConfig}
        isTrial={isTrial}
      />
    );

    const onePagePngElement = document.createElement("div");
    onePagePngElement.innerHTML = renderedOnePagePng;

    const pngIcon = await toPng(onePagePngElement, {
      pixelRatio: 6,
      width: 827, // 2480 / 3
      height: 1169, // 3508 / 3
    });

    onePagePngElement.remove();

    return pngIcon;
  };

  return (
    <>
      {integrationType === IntegrationTypesEnum.ON_OFFICE && (
        <button
          className="btn btn-primary btn-sm"
          disabled={downloadButtonDisabled}
          onClick={async () => {
            await sendToOnOffice({
              filename: `${documentTitle}.png`,
              base64Content: (
                await getRenderedPngImage()
              ).replace(/^data:.*;base64,/, ""),
              fileTitle: documentTitle,
              artType: ApiOnOfficeArtTypesEnum.FOTO,
              // TODO ask Michael how to use FOTO_GROSS instead of FOTO
              // "filesize": 8364316,
              // artType: ApiOnOfficeArtTypesEnum.FOTO_GROSS,
            });
          }}
        >
          An onOffice senden
        </button>
      )}

      <button
        className="btn btn-primary btn-sm"
        disabled={downloadButtonDisabled}
        onClick={async () => {
          saveAs(await getRenderedPngImage(), `${documentTitle}.png`);
        }}
      >
        Exportieren
      </button>
    </>
  );
};

export default OnePagePngDownload;

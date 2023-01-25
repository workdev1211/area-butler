import { FunctionComponent, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";

import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { ApiUser } from "../../../../shared/types/types";
import { ISelectableMapClipping } from "export/MapClippingSelection";
import { ILegendItem } from "../Legend";
import { IQrCodeState } from "../ExportModal";
import OnePagePng from "./OnePagePng";
import { getQrCodeBase64 } from "../QrCode";
import {
  createDirectLink,
  preferredLocationsTitle,
} from "../../shared/shared.functions";
import { EntityGroup } from "../../components/SearchResultContainer";
import { IPoiIcon } from "../../shared/shared.types";

interface IOnePageDownloadProps {
  addressDescription: string;
  groupedEntries: EntityGroup[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  downloadButtonDisabled: boolean;
  user: ApiUser | null;
  color?: string;
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  qrCode: IQrCodeState;
  isTransparentBackground: boolean;
}

export const OnePagePngDownload: FunctionComponent<IOnePageDownloadProps> = ({
  addressDescription,
  groupedEntries,
  listingAddress,
  realEstateListing,
  downloadButtonDisabled,
  user,
  color,
  legend,
  mapClippings,
  qrCode,
  isTransparentBackground,
}) => {
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

  const filteredGroups = groupedEntries.reduce<
    (EntityGroup & { icon?: IPoiIcon })[]
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

  if (user?.exportFonts?.length) {
    const exportFont = user.exportFonts[0];
    fontFamily = exportFont.fontFamily;

    onePagePngStyle = `#one-page-png { font-family: ${fontFamily}; } ${exportFont.fontFaces.join(
      " ,"
    )}`;
  } else {
    onePagePngStyle = `#one-page-png { font-family: ${fontFamily}; }`;
  }

  return (
    <div>
      <button
        className="btn btn-primary btn-sm"
        disabled={downloadButtonDisabled}
        onClick={async () => {
          const renderedOnePagePng = renderToStaticMarkup(
            <OnePagePng
              addressDescription={addressDescription}
              filteredGroups={filteredGroups}
              listingAddress={listingAddress}
              realEstateListing={realEstateListing}
              user={user}
              color={color}
              legend={legend}
              mapClippings={selectedMapClippings}
              qrCodeImage={qrCodeImage}
              isTransparentBackground={isTransparentBackground}
              style={onePagePngStyle}
            />
          );

          const onePagePngElement = document.createElement("div");
          onePagePngElement.innerHTML = renderedOnePagePng;

          const pngIcon = await toPng(onePagePngElement, {
            pixelRatio: 6,
            width: 827, // 2480 / 3
            height: 1169, // 3508 / 3
          });

          saveAs(pngIcon, `${documentTitle}.png`);

          onePagePngElement.remove();
        }}
      >
        Exportieren
      </button>
    </div>
  );
};

export default OnePagePngDownload;

import { FunctionComponent } from "react";
import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
} from "docx";
import { saveAs } from "file-saver";

import { ISelectableMapClipping } from "export/MapClippingSelection";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { deriveColorPalette } from "shared/shared.functions";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
  TransportationParam,
} from "../../../../shared/types/types";
import { createHeader } from "./creator/header.creator";
import { createFooter } from "./creator/footer.creator";
import { createImage } from "./creator/image.creator";
import { createQrCodeHeader } from "./creator/qr-code-header.creator";
import { createWatermark } from "./creator/watermark.creator";
import { createLegend } from "./creator/legend.creator";
import {
  createTable,
  mapTableDataFromCensusData,
  mapTableDataFromEntityGrid,
  mapTableDataFromEntityGroup,
  mapTableDataFromFederalElectionData,
  mapTableDataFromParticlePollutionData,
} from "./creator/table.creator";
import areaButlerIcon from "../../assets/icons/ab.png";
import { EntityGroup } from "../../components/SearchResultContainer";
import { base64PrefixRegex } from "../../shared/shared.constants";
import { ILegendItem } from "../Legend";
import { IQrCodeState } from "../ExportModal";
import { ApiSubscriptionPlanType } from "../../../../shared/types/subscription-plan";

export interface DocxExposeProps {
  censusData: ApiGeojsonFeature[];
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  mapClippings: ISelectableMapClipping[];
  user: ApiUser | null;
  color?: string;
  legend: ILegendItem[];
  qrCode: IQrCodeState;
}

const DocxExpose: FunctionComponent<DocxExposeProps> = ({
  groupedEntries,
  mapClippings,
  censusData,
  federalElectionData,
  particlePollutionData,
  transportationParams,
  activeMeans,
  user,
  realEstateListing,
  listingAddress,
  color,
  legend,
  qrCode,
}) => {
  const colorPalette = deriveColorPalette(color || user?.color || "#AA0C54");

  let documentTitle = "MeinStandort_AreaButler";

  if (realEstateListing?.name) {
    documentTitle = `${realEstateListing.name.replace(/\s/g, "")}_AreaButler`;
  }

  if (listingAddress) {
    documentTitle = `${
      listingAddress.replace(/\s/g, "").split(",")[0]
    }_AreaButler`;
  }

  const generate = async (): Promise<void> => {
    const watermark = await createWatermark(
      user?.subscription?.type === ApiSubscriptionPlanType.TRIAL
    );

    const gridSummary = createTable(
      {
        title: "Die Umgebung",
        pageBreak: false,
        columnWidths: [4000, 3000, 3000, 3000, 3000],
        headerColor: colorPalette.primaryColor,
        headerTextColor: colorPalette.textColor,
        ...mapTableDataFromEntityGrid(
          groupedEntries,
          transportationParams,
          activeMeans
        ),
      },
      watermark
    );

    const tables = groupedEntries.map((group) =>
      createTable(
        {
          title: group.title,
          columnWidths: [5000, 2000, 1500, 1500, 1500],
          headerColor: colorPalette.primaryColor,
          headerTextColor: colorPalette.textColor,
          ...mapTableDataFromEntityGroup(group, activeMeans),
        },
        watermark
      )
    );

    const censusTable =
      censusData && censusData.length > 0
        ? createTable({
            pageBreak: false,
            title: "Nachbarschaftsdemographie",
            columnWidths: [5000, 2000, 3000],
            headerColor: colorPalette.primaryColor,
            headerTextColor: colorPalette.textColor,
            ...mapTableDataFromCensusData(censusData),
          })
        : [];

    const federalElectionTable = federalElectionData
      ? createTable({
          pageBreak: false,
          title: "Bundestagswahl 2021",
          columnWidths: [2000, 5000, 5000],
          headerColor: colorPalette.primaryColor,
          headerTextColor: colorPalette.textColor,
          ...mapTableDataFromFederalElectionData(federalElectionData),
        })
      : [];

    const particlePollutionTable = particlePollutionData
      ? createTable({
          pageBreak: false,
          title: "Feinstaubbelastung",
          columnWidths: [5000, 2000, 3000],
          headerColor: colorPalette.primaryColor,
          headerTextColor: colorPalette.textColor,
          ...mapTableDataFromParticlePollutionData(particlePollutionData),
        })
      : [];

    const mapSectionChildren = mapClippings.reduce<
      (Paragraph | ImageRun | Table)[]
    >(
      (result, clipping, i) => {
        if (!clipping.selected) {
          return result;
        }

        const image = createImage(
          clipping.mapClippingDataUrl.replace(base64PrefixRegex, "")
        );

        if (i % 2 === 1) {
          result.push(
            new Paragraph({ children: [new PageBreak()] }),
            watermark,
            image
          );
          return result;
        }

        result.push(image);
        return result;
      },
      [
        watermark,
        new Paragraph({
          spacing: { before: 500, after: 500 },
          heading: HeadingLevel.HEADING_1,
          text: "Kartenausschnitte",
        }),
      ]
    );

    if (mapSectionChildren.length > 2 && legend.length > 0) {
      const legendTable = await createLegend(legend);

      mapSectionChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          spacing: { before: 500, after: 500 },
          heading: HeadingLevel.HEADING_1,
          text: "Kartenlegende",
        }),
        watermark,
        legendTable
      );
    }

    // docx supports jpeg, jpg, bmp, gif and png

    const metadata = user?.logo
      ? user?.logo.match(base64PrefixRegex)![0]
      : "data:image/png;base64,";

    const imageBase64Data = user?.logo
      ? user?.logo!.replace(base64PrefixRegex, "")!
      : btoa(
          String.fromCharCode(
            // TODO check the compiler settings
            // @ts-ignore
            ...new Uint8Array(await (await fetch(areaButlerIcon)).arrayBuffer())
          )
        );

    const logoImage = new Image();
    logoImage.src = `${metadata}${imageBase64Data}`;
    await logoImage.decode();

    const logoRatio =
      Math.round((logoImage.width / logoImage.height) * 10) / 10;

    const gridAndTablesSectionChildren = [
      ...gridSummary,
      ...tables.flatMap((t) => t),
    ];

    const externalDataSectionChildren = [];

    if (
      censusTable.length > 0 ||
      federalElectionTable.length > 0 ||
      particlePollutionTable.length > 0
    ) {
      externalDataSectionChildren.push(
        watermark,
        ...censusTable,
        ...federalElectionTable,
        ...particlePollutionTable
      );
    }

    const commonHeader = createHeader(imageBase64Data, logoRatio);
    const sections = [];

    sections.push({
      headers: {
        ...commonHeader,
      },
      children: gridAndTablesSectionChildren,
      footers: {
        ...createFooter(),
      },
    });

    if (mapSectionChildren.length > 2) {
      sections.push({
        headers: {
          ...(qrCode.isShownQrCode
            ? await createQrCodeHeader(
                qrCode.snapshotToken!,
                imageBase64Data,
                logoRatio
              )
            : commonHeader),
        },
        children: mapSectionChildren,
        footers: {
          ...createFooter(),
        },
      });
    }

    if (externalDataSectionChildren.length > 0) {
      sections.push({
        headers: {
          ...commonHeader,
        },
        children: externalDataSectionChildren,
        footers: {
          ...createFooter(),
        },
      });
    }

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            run: {
              font: "Arial",
              size: 32,
              color: "000000",
            },
          },
        ],
      },
      sections,
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${documentTitle}.docx`);
    });
  };

  return (
    <button className="btn btn-primary btn-sm" onClick={generate}>
      Exportieren
    </button>
  );
};

export default DocxExpose;

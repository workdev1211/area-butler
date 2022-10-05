import { FunctionComponent } from "react";
import {
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

import { SelectedMapClipping } from "export/MapClippingSelection";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { deriveColorPalette } from "shared/shared.functions";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
  TransportationParam,
} from "../../../../shared/types/types";
import { createFooter } from "./creator/footer.creator";
import { createHeader } from "./creator/header.creator";
import { createImage } from "./creator/image.creator";
import {
  createTable,
  mapTableDataFromCensusData,
  mapTableDataFromEntityGrid,
  mapTableDataFromEntityGroup,
  mapTableDataFromFederalElectionData,
  mapTableDataFromParticlePollutiondata,
} from "./creator/table.creator";
import AreaButlerLogo from "../../assets/img/logo.jpg";
import { EntityGroup } from "../../components/SearchResultContainer";
import { base64PrefixRegex } from "../../shared/shared.constants";
import { getRenderedLegend } from "../RenderedLegend";
import { ILegendItem } from "../Legend";
import { IQrCodeState } from "../ExportModal";
import { createQrCodeHeader } from "./creator/qr-code-header.creator";

export interface DocxExposeProps {
  censusData: ApiGeojsonFeature[];
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  mapClippings: SelectedMapClipping[];
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
    const gridSummary = createTable({
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
    });

    const tables = groupedEntries.map((group) =>
      createTable({
        title: group.title,
        columnWidths: [5000, 2000, 1500, 1500, 1500],
        headerColor: colorPalette.primaryColor,
        headerTextColor: colorPalette.textColor,
        ...mapTableDataFromEntityGroup(group, activeMeans),
      })
    );

    const censusTable =
      censusData && censusData.length > 0
        ? [
            createTable({
              pageBreak: false,
              title: "Nachbarschaftsdemographie",
              columnWidths: [5000, 2000, 3000],
              headerColor: colorPalette.primaryColor,
              headerTextColor: colorPalette.textColor,
              ...mapTableDataFromCensusData(censusData),
            }),
          ]
        : [];

    const federalElectionTable = federalElectionData
      ? [
          createTable({
            pageBreak: false,
            title: "Bundestagswahl 2021",
            columnWidths: [2000, 5000, 5000],
            headerColor: colorPalette.primaryColor,
            headerTextColor: colorPalette.textColor,
            ...mapTableDataFromFederalElectionData(federalElectionData),
          }),
        ]
      : [];

    const particlePollutionTable = particlePollutionData
      ? [
          createTable({
            pageBreak: false,
            title: "Feinstaubbelastung",
            columnWidths: [5000, 2000, 3000],
            headerColor: colorPalette.primaryColor,
            headerTextColor: colorPalette.textColor,
            ...mapTableDataFromParticlePollutiondata(particlePollutionData),
          }),
        ]
      : [];

    // TODO leave only reduce
    let images = mapClippings
      .filter((c) => c.selected)
      .map((c) =>
        createImage(c.mapClippingDataUrl.replace(base64PrefixRegex, ""))
      );

    if (images.length > 0) {
      images = [
        new Paragraph({
          spacing: { before: 500, after: 500 },
          heading: HeadingLevel.HEADING_1,
          text: "Kartenausschnitte",
        }),
        ...images,
      ];
    }

    if (images.length > 0 && legend.length > 0) {
      const renderedLegend = await getRenderedLegend(legend);
      const legendColumn1: Paragraph[] = [];
      const legendColumn2: Paragraph[] = [];

      renderedLegend.forEach(({ title, icon }, index) => {
        const legendParagraph = new Paragraph({
          spacing: {
            before: 100,
            after: 100,
          },
          children: [
            new ImageRun({
              data: Uint8Array.from(atob(icon), (c) => c.charCodeAt(0)),
              transformation: {
                width: 36,
                height: 36,
              },
            }),
            new TextRun({ text: title, font: "Arial" }),
          ],
        });

        if (index < Math.ceil(renderedLegend.length / 2)) {
          legendColumn1.push(legendParagraph);
        } else {
          legendColumn2.push(legendParagraph);
        }
      });

      const legendTableParagraph = new Paragraph({
        children: [
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                    },
                    children: [...legendColumn1],
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                    },
                    children: [...legendColumn2],
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      images.push(
        new Paragraph({
          pageBreakBefore: true,
          spacing: { before: 500, after: 500 },
          heading: HeadingLevel.HEADING_1,
          text: "Kartenlegende",
        }),
        legendTableParagraph
      );
    }

    const metadata = user?.logo
      ? user?.logo.match(base64PrefixRegex)![0]
      : "data:image/svg+xml;base64,";

    const imageBase64Data = user?.logo
      ? user?.logo!.replace(base64PrefixRegex, "")!
      : btoa(
          String.fromCharCode(
            // TODO check the compiler settings
            // @ts-ignore
            ...new Uint8Array(await (await fetch(AreaButlerLogo)).arrayBuffer())
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

    const mapSectionChildren = [...images];
    const externalDataSectionChildren = [];

    if (
      censusTable.length ||
      federalElectionTable.length ||
      particlePollutionTable.length
    ) {
      externalDataSectionChildren.push(
        ...censusTable.flatMap((t) => t),
        ...federalElectionTable.flatMap((t) => t),
        ...particlePollutionTable.flatMap((t) => t)
      );
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
      sections: [
        {
          headers: {
            ...createHeader(imageBase64Data, logoRatio),
          },
          children: gridAndTablesSectionChildren,
          footers: {
            ...createFooter(),
          },
        },
        {
          headers: {
            ...(qrCode.isShownQrCode
              ? await createQrCodeHeader(
                  qrCode.snapshotToken!,
                  imageBase64Data,
                  logoRatio
                )
              : createHeader(imageBase64Data, logoRatio)),
          },
          children: mapSectionChildren,
          footers: {
            ...createFooter(),
          },
        },
        {
          headers: {
            ...createHeader(imageBase64Data, logoRatio),
          },
          children: externalDataSectionChildren,
          footers: {
            ...createFooter(),
          },
        },
      ],
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

import { Document, Packer, Paragraph, PageBreak, HeadingLevel } from "docx";
import { SelectedMapClipping } from "export/MapClippingSelection";
import { saveAs } from "file-saver";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { EntityGroup } from "pages/SearchResultPage";
import { deriveColorPalette } from "shared/shared.functions";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
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

export interface DocxExposeProps {
  censusData: ApiGeojsonFeature[];
  federalElectionData: FederalElectionDistrict;
  particlePollutionData: ApiGeojsonFeature[];
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  mapClippings: SelectedMapClipping[];
  user: ApiUser | null;
}

const DocxExpose: React.FunctionComponent<DocxExposeProps> = ({
  groupedEntries,
  mapClippings,
  censusData,
  federalElectionData,
  particlePollutionData,
  transportationParams,
  user,
  realEstateListing,
  listingAddress,
}) => {
  const colorPalette = deriveColorPalette(
    !!user?.color ? user.color! : "#AA0C54"
  );

  let documentTitle = "MeinStandort_AreaButler";

  if (!!realEstateListing?.name) {
    documentTitle = `${realEstateListing.name.replace(/\s/g, "")}_AreaButler`;
  }

  if (!!listingAddress) {
    documentTitle = `${
      listingAddress.replace(/\s/g, "").split(",")[0]
    }_AreaButler`;
  }

  const generate = async () => {
    const gridSummary = createTable({
      title: "Die Umgebung",
      pageBreak: false,
      columnWidths: [4000, 3000, 3000, 3000, 3000],
      headerColor: colorPalette.primaryColor,
      headerTextColor: colorPalette.textColor,
      ...mapTableDataFromEntityGrid(groupedEntries, transportationParams),
    });

    const tables = groupedEntries.map((group) =>
      createTable({
        title: group.title,
        columnWidths: [5000, 2000, 1500, 1500, 1500],
        headerColor: colorPalette.primaryColor,
        headerTextColor: colorPalette.textColor,
        ...mapTableDataFromEntityGroup(group),
      })
    );

    const censusTable =
      !!censusData && censusData.length > 0
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

    const federalElectionTable = !!federalElectionData
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

    const particlePollutionTable = !!federalElectionData
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

    let images = mapClippings
      .filter((c) => c.selected)
      .map((c) =>
        createImage(c.mapClippingDataUrl.replace("data:image/jpeg;base64,", ""))
      );

    if (images.length > 0) {
      images = [
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          spacing: { before: 500, after: 500 },
          heading: HeadingLevel.HEADING_1,
          text: "Kartenausschnitte",
        }),
        ...images,
      ];
    }

    const imageBase64Data = !!user?.logo ? user?.logo!.replace("data:image/png;base64,", "")! : await (await fetch(AreaButlerLogo)).blob();

    console.log(imageBase64Data);

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
            ...createHeader(imageBase64Data),
          },
          children: [
            ...gridSummary,
            ...tables.flatMap((t) => t),
            ...images,
            new Paragraph({ children: [new PageBreak()] }),
            ...censusTable.flatMap((t) => t),
            ...federalElectionTable.flatMap((t) => t),
            ...particlePollutionTable.flatMap((t) => t),
          ],
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

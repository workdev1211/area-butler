import { Document, Packer, Paragraph, PageBreak, HeadingLevel } from "docx";
import { SelectedMapClipping } from "export/MapClippingSelection";
import { saveAs } from "file-saver";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { deriveColorPalette } from "shared/shared.functions";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  ApiGeojsonFeature,
  ApiUser,
  MeansOfTransportation,
  TransportationParam
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
  mapTableDataFromParticlePollutiondata
} from "./creator/table.creator";
import AreaButlerLogo from "../../assets/img/logo.jpg";
import { EntityGroup } from "../../components/SearchResultContainer";

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
}

const DocxExpose: React.FunctionComponent<DocxExposeProps> = ({
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
  color
}) => {
  const colorPalette = deriveColorPalette(color || user?.color || "#AA0C54");

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
      ...mapTableDataFromEntityGrid(
        groupedEntries,
        transportationParams,
        activeMeans
      )
    });

    const tables = groupedEntries.map(group =>
      createTable({
        title: group.title,
        columnWidths: [5000, 2000, 1500, 1500, 1500],
        headerColor: colorPalette.primaryColor,
        headerTextColor: colorPalette.textColor,
        ...mapTableDataFromEntityGroup(group, activeMeans)
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
              ...mapTableDataFromCensusData(censusData)
            })
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
            ...mapTableDataFromFederalElectionData(federalElectionData)
          })
        ]
      : [];

    const particlePollutionTable = !!particlePollutionData
      ? [
          createTable({
            pageBreak: false,
            title: "Feinstaubbelastung",
            columnWidths: [5000, 2000, 3000],
            headerColor: colorPalette.primaryColor,
            headerTextColor: colorPalette.textColor,
            ...mapTableDataFromParticlePollutiondata(particlePollutionData)
          })
        ]
      : [];

    const base64PrefixRegex = /data:.+;base64,/;

    let images = mapClippings
      .filter(c => c.selected)
      .map(c =>
        createImage(c.mapClippingDataUrl.replace(base64PrefixRegex, ""))
      );

    if (images.length > 0) {
      images = [
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          spacing: { before: 500, after: 500 },
          heading: HeadingLevel.HEADING_1,
          text: "Kartenausschnitte"
        }),
        ...images
      ];
    }

    const imageBase64Data = !!user?.logo
      ? user?.logo!.replace(base64PrefixRegex, "")!
      : await (await fetch(AreaButlerLogo)).blob();

    const sectionChildren = [
      ...gridSummary,
      ...tables.flatMap((t) => t),
      ...images,
    ];

    if (
      censusTable.length ||
      federalElectionTable.length ||
      particlePollutionTable.length
    ) {
      sectionChildren.push(
        new Paragraph({ children: [new PageBreak()] }),
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
              color: "000000"
            }
          }
        ]
      },
      sections: [
        {
          headers: {
            ...createHeader(imageBase64Data)
          },
          children: sectionChildren,
          footers: {
            ...createFooter()
          }
        }
      ]
    });

    Packer.toBlob(doc).then(blob => {
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

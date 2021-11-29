import {
  Document,
  Packer,
  Header,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
} from "docx";
import { SelectedMapClipping } from "export/MapClippingSelection";
import { saveAs } from "file-saver";
import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { EntityGroup, ResultEntity } from "pages/SearchResultPage";
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
  mapTableDataFromEntityGroup,
} from "./creator/table.creator";

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
  user,
}) => {
  const generate = async () => {
    const tables = groupedEntries.map((group) =>
      createTable({
        columnWidths: [5000, 2000, 1500, 1500, 1500],
        headerColor: user ? user.color! : "#AA0C54",
        headerTextColor: "#FFFFFF",
        ...mapTableDataFromEntityGroup(group),
      })
    );

    const censusTable =
      !!censusData && censusData.length > 0
        ? [
            createTable({
              columnWidths: [5000, 2000, 3000],
              headerColor: user ? user.color! : "#AA0C54",
              headerTextColor: "#FFFFFF",
              ...mapTableDataFromCensusData(censusData),
            }),
          ]
        : [];

    const images = mapClippings
      .filter((c) => c.selected)
      .map((c) =>
        createImage(c.mapClippingDataUrl.replace("data:image/jpeg;base64,", ""))
      );

    const imageBase64Data = user?.logo!.replace("data:image/png;base64,", "")!;

    const doc = new Document({
      sections: [
        {
          headers: {
            ...createHeader(imageBase64Data),
          },
          children: [...tables, ...images, ...censusTable],
          footers: {
            ...createFooter(),
          },
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Umgebungsanalyse.docx");
    });
  };

  return (
    <button className="btn btn-primary btn-sm" onClick={generate}>
      Exportieren
    </button>
  );
};

export default DocxExpose;

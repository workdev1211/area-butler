import {
  Table,
  TableRow,
  TableCell,
  TextRun,
  Paragraph,
  WidthType,
  ShadingType,
} from "docx";
import { averageCensus } from "map/CensusTable";
import { EntityGroup, ResultEntity } from "pages/SearchResultPage";
import { deriveMinutesFromMeters } from "shared/shared.functions";
import {
  ApiGeojsonFeature,
  MeansOfTransportation,
} from "../../../../../shared/types/types";

export interface TableProps {
  data: { header: string[]; body: string[][] };
  columnWidths: number[];
  headerColor: string;
  headerTextColor: string;
}

export const createTable = ({
  data,
  columnWidths,
  headerColor,
  headerTextColor,
}: TableProps) => {
  return new Table({
    columnWidths,
    rows: [
      new TableRow({
        cantSplit: true,
        tableHeader: true,
        children: data.header.map(
          (h) =>
            new TableCell({
              shading: {
                type: ShadingType.PERCENT_10,
                fill: headerColor,
                color: headerTextColor,
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      color: headerTextColor,
                      bold: true,
                      text: h,
                      font: "Arial",
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
      ...data.body.map(
        (b) =>
          new TableRow({
            children: b.map(
              (bv) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: bv, font: "Arial" })],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  });
};

export const mapTableDataFromEntityGroup = (
  group: EntityGroup
): { data: { header: string[]; body: string[][] } } => {
  const header = [];
  header.push("Name");
  header.push("Entfernung");
  header.push("Zu Fuß");
  header.push("Fahrrad");
  header.push("Auto");

  return {
    data: {
      header,
      body: group.items
        .filter((item: ResultEntity) => item.selected)
        .map((item) => {
          return [
            item.name || group.title,
            item.distanceInMeters
              ? Math.trunc(item.distanceInMeters) + " m"
              : "unbekannt",
            item.byFoot
              ? `${Math.trunc(
                  deriveMinutesFromMeters(
                    item.distanceInMeters,
                    MeansOfTransportation.WALK
                  )
                )} min`
              : "",
            item.byBike
              ? `${Math.trunc(
                  deriveMinutesFromMeters(
                    item.distanceInMeters,
                    MeansOfTransportation.BICYCLE
                  )
                )} min`
              : "",
            item.byCar
              ? `${Math.trunc(
                  deriveMinutesFromMeters(
                    item.distanceInMeters,
                    MeansOfTransportation.CAR
                  )
                )} min`
              : "",
          ];
        }),
    },
  };
};

export const mapTableDataFromCensusData = (
  censusData: ApiGeojsonFeature[]
): { data: { header: string[]; body: string[][] } } => {
  const censusCenter =
    censusData.find((c) =>
      (c.properties as any).some((p: any) => p.value !== "unbekannt")
    ) || (censusData[0] as any);

  const header = [];
  header.push("Beschreibung");
  header.push("Wert");
  header.push("Ø Deutschland");

  return {
    data: {
      header,
      body: censusCenter.properties.map(
        (p: { label: string; value: string; unit: string }) => [
          p.label,
          `${p.value} ${p.unit}`,
          `${averageCensus[p.label]}${!p.unit ? "" : " " + p.unit}`,
        ]
      ),
    },
  };
};

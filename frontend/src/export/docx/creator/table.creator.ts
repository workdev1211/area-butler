import {
  HeadingLevel,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { routingProfileOrder } from "export/EntityGridSummary";
import {
  FederalElectionDistrict,
  FederalElectionResult,
} from "hooks/federalelectiondata";
import { averageCensus } from "map/menu/data/CensusTable";
import {
  averageParticlePollution,
  PollutionData,
} from "map/menu/data/ParticlePollutionTable";
import {
  deriveMinutesFromMeters,
  distanceToHumanReadable,
  timeToHumanReadable,
} from "shared/shared.functions";
import {
  meansOfTransportations,
  unitsOfTransportation,
} from "../../../../../shared/constants/constants";
import {
  ApiGeojsonFeature,
  MeansOfTransportation,
  TransportationParam,
} from "../../../../../shared/types/types";
import {
  EntityGroup,
  ResultEntity,
} from "../../../components/SearchResultContainer";

export interface TableProps {
  data: { header: string[]; body: string[][] };
  columnWidths: number[];
  headerColor: string;
  headerTextColor: string;
  pageBreak?: boolean;
  title?: string;
}

export const createTable = (
  {
    data,
    columnWidths,
    headerColor,
    headerTextColor,
    title,
    pageBreak = true,
  }: TableProps,
  watermark: Paragraph = new Paragraph({ children: [] })
): (Paragraph | Table)[] => {
  const titleParagraph = title
    ? [
        new Paragraph({
          spacing: { before: 500, after: 500 },
          heading: HeadingLevel.HEADING_1,
          text: title,
        }),
      ]
    : [];

  const pageBreakParagraph = pageBreak
    ? [new Paragraph({ children: [new PageBreak()] })]
    : [];

  return [
    ...pageBreakParagraph,
    ...titleParagraph,
    watermark,
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          cantSplit: true,
          tableHeader: true,
          children: data.header.map(
            (h) =>
              new TableCell({
                shading: {
                  type: ShadingType.CLEAR,
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
          (b, i) =>
            new TableRow({
              children: b.map(
                (bv) =>
                  new TableCell({
                    shading:
                      i % 2 === 0
                        ? {
                            type: ShadingType.PERCENT_10,
                            fill: "f3f3f4",
                            color: "f3f3f4",
                          }
                        : undefined,
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
    }),
  ];
};

export const mapTableDataFromEntityGroup = (
  group: EntityGroup,
  activeMeans: MeansOfTransportation[]
): { data: { header: string[]; body: string[][] } } => {
  const header = [];
  header.push("Name");
  header.push("Entfernung");

  if (activeMeans.includes(MeansOfTransportation.WALK)) {
    header.push("Zu Fuß");
  }

  if (activeMeans.includes(MeansOfTransportation.BICYCLE)) {
    header.push("Fahrrad");
  }
  if (activeMeans.includes(MeansOfTransportation.CAR)) {
    header.push("Auto");
  }

  return {
    data: {
      header,
      body: group.items
        .filter((item: ResultEntity) => item.selected)
        .map((item) => {
          const values = [];

          values.push(item.name || group.title);
          values.push(
            item.distanceInMeters
              ? distanceToHumanReadable(Math.trunc(item.distanceInMeters))
              : "unbekannt"
          );

          if (activeMeans.includes(MeansOfTransportation.WALK)) {
            values.push(
              item.byFoot
                ? timeToHumanReadable(
                    Math.trunc(
                      deriveMinutesFromMeters(
                        item.distanceInMeters,
                        MeansOfTransportation.WALK
                      )
                    )
                  )
                : ""
            );
          }

          if (activeMeans.includes(MeansOfTransportation.BICYCLE)) {
            values.push(
              item.byBike
                ? timeToHumanReadable(
                    Math.trunc(
                      deriveMinutesFromMeters(
                        item.distanceInMeters,
                        MeansOfTransportation.BICYCLE
                      )
                    )
                  )
                : ""
            );
          }
          if (activeMeans.includes(MeansOfTransportation.CAR)) {
            values.push(
              item.byCar
                ? timeToHumanReadable(
                    Math.trunc(
                      deriveMinutesFromMeters(
                        item.distanceInMeters,
                        MeansOfTransportation.CAR
                      )
                    )
                  )
                : ""
            );
          }

          return values;
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
  header.push("Beschreibung (pro km2)");
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

export const mapTableDataFromFederalElectionData = (
  federalElectionDistrict: FederalElectionDistrict
): { data: { header: string[]; body: string[][] } } => {
  const header = [];
  header.push("Partei");
  header.push("Ergebnis Zweitstimme (Prozent)");
  header.push("Ergebnis bei der letzten Wahl");

  return {
    data: {
      header,
      body: federalElectionDistrict.results.map((p: FederalElectionResult) => [
        p.party,
        p.percentage + " %",
        p.lastElectionPercentage + " %",
      ]),
    },
  };
};

export const mapTableDataFromParticlePollutionData = (
  particlePollutionData?: ApiGeojsonFeature[]
): { data: { header: string[]; body: string[][] } } => {
  const properties = particlePollutionData![0].properties as any;

  const pollutionData: PollutionData = {
    mean: properties.MEAN || 0,
    daysAboveThreshold:
      properties["Tage mit Tagesmittelwerten > 50 �g/m�"] || 0,
  };

  const header = [];
  header.push("Beschreibung");
  header.push("Wert");
  header.push("Ø Deutschland");

  return {
    data: {
      header,
      body: [
        [
          "Durchschnittliche Belastung",
          pollutionData.mean + " g/m3",
          averageParticlePollution.mean + " g/m3",
        ],
        [
          "Tage über Grenzwert (50 g/m3)",
          pollutionData.daysAboveThreshold + "",
          averageParticlePollution.daysAboveThreshold + "",
        ],
      ],
    },
  };
};

export const mapTableDataFromEntityGrid = (
  groupedEntries: EntityGroup[],
  transportationParams: TransportationParam[],
  activeMeans: MeansOfTransportation[]
): { data: { header: string[]; body: string[][] } } => {
  const byFootAvailable = transportationParams.some(
    (param) =>
      param.type === MeansOfTransportation.WALK &&
      activeMeans.includes(param.type)
  );
  const byBikeAvailable = transportationParams.some(
    (param) =>
      param.type === MeansOfTransportation.BICYCLE &&
      activeMeans.includes(param.type)
  );
  const byCarAvailable = transportationParams.some(
    (param) =>
      param.type === MeansOfTransportation.CAR &&
      activeMeans.includes(param.type)
  );

  const header = [];
  header.push("");
  header.push("Nächster Ort");

  transportationParams
    .filter((t) => activeMeans.includes(t.type))
    .sort(
      (t1, t2) =>
        routingProfileOrder.indexOf(t1.type) -
        routingProfileOrder.indexOf(t2.type)
    )
    .forEach((t) => {
      const meansLabel = meansOfTransportations.find(
        (means) => means.type === t.type
      )?.label;
      const meansUnit = unitsOfTransportation.find(
        (unit) => unit.type === t.unit
      )?.label;
      header.push(`${meansLabel} (${t.amount} ${meansUnit})`);
    });

  return {
    data: {
      header,
      body: groupedEntries
        .filter((g) => g.active)
        .map((g) => {
          const data: string[] = [];

          data.push(g.title);
          data.push(
            distanceToHumanReadable(
              Math.round(Math.min(...g.items.map((d) => d.distanceInMeters)))
            )
          );

          if (byFootAvailable) {
            data.push(
              g.items.filter((d: ResultEntity) => d.byFoot).length + ""
            );
          }

          if (byBikeAvailable) {
            data.push(
              g.items.filter((d: ResultEntity) => d.byBike).length + ""
            );
          }

          if (byCarAvailable) {
            data.push(g.items.filter((d: ResultEntity) => d.byCar).length + "");
          }

          return data;
        }),
    },
  };
};

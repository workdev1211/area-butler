import {
  BorderStyle,
  ImageRun,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { getRenderedLegend } from "../../RenderedLegend";
import { ILegendItem } from "../../Legend";

export const createLegend = async (legend: ILegendItem[]): Promise<Table> => {
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

  return new Table({
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
  });
};

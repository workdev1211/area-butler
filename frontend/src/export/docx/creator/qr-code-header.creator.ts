import {
  AlignmentType,
  BorderStyle,
  Header,
  ImageRun,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { toDataURL } from "qrcode";

import { base64PrefixRegex } from "../../../shared/shared.constants";

export const createQrCodeHeader = async (
  directLink: string,
  imageData: string,
  imageRatio = 1
): Promise<{ default: Header }> => {
  const height = 100;

  return {
    default: new Header({
      children: [
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: {
              style: BorderStyle.NONE,
            },
            bottom: {
              style: BorderStyle.NONE,
            },
            left: {
              style: BorderStyle.NONE,
            },
            right: {
              style: BorderStyle.NONE,
            },
            insideHorizontal: {
              style: BorderStyle.NONE,
            },
            insideVertical: {
              style: BorderStyle.NONE,
            },
          },
          rows: [
            new TableRow({
              children: [
                // Qr Code cell
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      children: [
                        new Table({
                          width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                          },
                          borders: {
                            top: {
                              style: BorderStyle.NONE,
                            },
                            bottom: {
                              style: BorderStyle.NONE,
                            },
                            left: {
                              style: BorderStyle.NONE,
                            },
                            right: {
                              style: BorderStyle.NONE,
                            },
                            insideHorizontal: {
                              style: BorderStyle.NONE,
                            },
                            insideVertical: {
                              style: BorderStyle.NONE,
                            },
                          },
                          rows: [
                            new TableRow({
                              children: [
                                new TableCell({
                                  children: [
                                    new Paragraph({
                                      children: [
                                        new ImageRun({
                                          data: Uint8Array.from(
                                            atob(
                                              (
                                                await toDataURL(directLink, {
                                                  type: "image/png",
                                                  margin: 0,
                                                })
                                              ).replace(base64PrefixRegex, "")
                                            ),
                                            (c) => c.charCodeAt(0)
                                          ),
                                          transformation: {
                                            width: 100,
                                            height: 100,
                                          },
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                new TableCell({
                                  verticalAlign: VerticalAlign.CENTER,
                                  children: [
                                    new Paragraph({
                                      children: [
                                        new TextRun({
                                          text: "Scannen und neue",
                                          font: "Arial",
                                        }),
                                        new TextRun({
                                          text: "Wohnlage entdecken",
                                          font: "Arial",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                // Logo cell
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new ImageRun({
                          data: Uint8Array.from(atob(imageData), (c) =>
                            c.charCodeAt(0)
                          ),
                          transformation: {
                            width: height * imageRatio,
                            height,
                          },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  };
};

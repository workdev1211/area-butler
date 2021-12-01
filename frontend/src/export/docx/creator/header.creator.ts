import {
  Header, ImageRun, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle
} from "docx";

export const createHeader = (imageData: string | Blob ) => {
  return {
    default: new Header({
      children: [
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          borders: {
            top: {
              style: BorderStyle.NONE
            },
            bottom: {
              style: BorderStyle.NONE
            },
            left: {
              style: BorderStyle.NONE
            },
            right: {
              style: BorderStyle.NONE
            }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new ImageRun({
                          data: typeof imageData === 'string' ?  Uint8Array.from(atob(imageData), (c) =>
                            c.charCodeAt(0)
                          ) : imageData as any as Buffer,
                          transformation: {
                            width: 300,
                            height: 100,
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
